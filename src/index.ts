import express from "express";
const app = express();
// import { check, validationResult } from 'express-validator';
import axios from "axios";
const port = 8080;

app.get( "/",(req: express.Request, res: express.Response) => {
    return axios.get('https://api.github.com/search/code/', {
        params: {
            q : `${req.query.search}\+in:file\+language:${req.query.language}\+repo:microsoft/vscode`,
        },
        headers: {'Accept': 'application/vnd.github.v3+json'},
        timeout: 1000,
    }).then((response: any) => {
        return response.json();
    }).then((response: any) => {
        console.log(response);
        res.status(200).send(response.data);
    }).catch((error: any) => {
        console.log(error);
        /*
          TODO: Might not want to send actual error to client.
         */
        return res.status(500).send(JSON.stringify(error));
    });
});

app.listen( port, () => {
  console.log( `server started at http://localhost:${ port }` );
} );


// app.get( "/", [
//     check('language').exists(),
//     check('search').exists(),
//     check('search').notEmpty,
//     check('search').isLength({ max: 256 }),
//     check('language').custom(value => {
//         return (value.toString().toUpperCase() === 'JAVASCRIPT' ||
//             value.toString().toUpperCase() === 'CSS' ||
//             value.toString().toUpperCase() === 'HTML')
//     })
//   ],(req: express.Request, res: express.Response) => {
//       const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//       }
//       return axios.get('https://api.github.com/search/code', {
//         params: {
//           q: 'allowRendererProcessReuse+in:file+language:javascript+repo:microsoft/vscode',
//         },
//         headers: {'Accept': 'application/vnd.github.v3+json'},
//         timeout: 1000,
//       }).then((response: any) => {
//             console.log(response.data);
//             res.status(200).send(JSON.stringify(response.data));
//       }).catch((error: any) => {
//             console.log(error);
//             /*
//               TODO: Might not want to send actual error to client.
//              */
//             return res.status(500).send(JSON.stringify(error));
//       });
// });
