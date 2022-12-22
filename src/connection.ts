// 3rd party dependencies
import { readFileSync } from 'fs';
import { createServer } from 'https';
import express from 'express';
import { WebSocketServer } from "ws";

// local dependencies
import { getAddress } from './utils';
import { log } from './log';

// express app
const app = express();

// the HTTP server
const port: number = 8443;
const server = createServer({
    cert: readFileSync('/etc/letsencrypt/live/jomity.net/cert.pem', 'utf8'),
    key: readFileSync('/etc/letsencrypt/live/jomity.net/privkey.pem', 'utf8')
}, app).listen(port, () => {
    log.server(`Server started on ${getAddress()}:${port}`);
});

// single-page HTTPS application for debugging
app.get('/', (req, res) => {
    res.send(`Multiplayer game server for https://${getAddress()}:${port}`);
});

// the websocket server
export const ws = new WebSocketServer({ server: server });