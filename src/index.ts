import express from "express";
const app = express();
const port = 8080;
import cors from "cors";
app.use(cors());
app.options('*', cors());

import axios from "axios";
import sqlite3 from "sqlite3";

import {dbFilePath} from "./env.js";
const db = new sqlite3.Database(dbFilePath, (err) => {
    if (err) {
        return console.error(err.message);
    }
});
db.run("CREATE TABLE IF NOT EXISTS searches (" +
    "ID INTEGER PRIMARY KEY AUTOINCREMENT," +
    "clientIP varchar(255) NOT NULL, " +
    "search varchar(255), " +
    "timestamp DATETIME NOT NULL)");

/*
    TODO: Choose data cache solution based on demands of application
    (performance, scalability, manageability, flexibility, affordability, etc.)
    instead of just simplicity
 */
import NodeCache from  "node-cache";
const paramsSerializer = (params: any) => Object.keys(params).map(p => `${p}=${params[p]}`).join("&");
/*
    The ttl for every generated cache element is one day.
    The automatic delete check is run every five minutes
 */
const entryCache = new NodeCache( { stdTTL: 86400, checkperiod: 120 } );

// TODO: Validate and Sanitize query parameter data
app.get( "/", cors(),(req: express.Request, res: express.Response) => {
    const search = `${req.query.search}+in:file+language:${req.query.language}+repo:microsoft/vscode`;
    const queryStringParam = 'q=' + search;
    const cacheValue = entryCache.get(queryStringParam);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    db.run("INSERT INTO searches(clientIP, search, timestamp) VALUES (?,?,?)", [ search, ip, Date.now() ]);
    if ( cacheValue !== undefined ){
        res.status(200).send(cacheValue);
        return;
    }
    axios.get('https://api.github.com/search/code', {
        params: { q : queryStringParam, },
        paramsSerializer,
        headers: {'Accept': 'application/vnd.github.v3+json'},
        timeout: 1000,
    }).then((response: any) => {
        const data = JSON.stringify(response.data);
        entryCache.set( queryStringParam, JSON.stringify(response.data) );
        res.status(200).send(data);
    }).catch((error: any) => {
        // TODO: Map error responses from api to appropriate client messages
        res.status(500).send(JSON.stringify(error));
    });
});

app.listen( port, () => {
    console.log("Server's up")
} );

process.on('SIGTERM', () => {
    db.close();
});
