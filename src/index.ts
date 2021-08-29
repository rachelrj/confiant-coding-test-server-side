import express from "express";
const port = 8080;
import cors from "cors";
import axios from "axios";
/*
    TODO: Choose data cache solution based on demands of application
    (performance, scalability, manageability, flexibility, affordability, etc.)
    instead of just simplicity
 */
import NodeCache from  "node-cache";
/*
    The ttl for every generated cache element is one day.
    The automatic delete check is run every five minutes
 */
const entryCache = new NodeCache( { stdTTL: 86400, checkperiod: 120 } );
const paramsSerializer = (params: any) => Object.keys(params).map(p => `${p}=${params[p]}`).join("&");


import { initializeDb, SearchRecord } from './initDb';
initializeDb().then((sequelizeInstance) => {
    const app = express();
    app.use(cors());
    app.options('*', cors());
    app.get( "/", cors(),(req: express.Request, res: express.Response) => {
        const search = `${req.query.search}+in:file+language:${req.query.language}+repo:microsoft/vscode`;
        const queryStringParam = 'q=' + search;
        const cacheValue = entryCache.get(queryStringParam);
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        sequelizeInstance.transaction().then((t) => {
            SearchRecord.create({
                clientIp: ip,
                search,
            }, {
                transaction: t
            }).then(() => {
                t.commit();
            }).catch((error) => {
                t.rollback();
            });
        });
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
    });

    process.on('SIGTERM', () => {
        sequelizeInstance.close()
    });
});
