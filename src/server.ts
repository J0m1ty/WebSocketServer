// local dependencies
import { ws } from './connection';
import { User } from './user';
import { log } from './log';
import { TokenGenerator } from './utils';
import { db } from './database';
import { AcknowledgmentManager } from './acknowledger';
import { eventManager } from './event';

import('./event').then(() => {
    eventManager.subscribe('ack', async (data, other, socket, db, user, am) => {
        log.debug(`Received ack for token ${data.ackToken}`);
        
        const success = am.resolve(data.ackToken);
    
        if (success) {
            user.connection.connected = true;
            user.connection.init = true;
            await User.saveUser(user);
        }
    });
});

ws.on("connection", async (client, req) => {
    const am = new AcknowledgmentManager(5000, () => {
        log.warn('Client did not acknowledge');
        client.close(1000, 'Client response timed out');
    });

    log.conn(`Client connected from ${req.socket.remoteAddress?.replace('::ffff:', '')}`);
    const searchParams = new URLSearchParams(req.url?.replace('/', ''));
    const token = searchParams.get('token');

    let user: Readonly<User> | null = token ? new User(await User.fetchUser(token)) : null;
    if (user) {
        log.info(`Authenticated a user`);
        user.connection.connected = true;
        user.connection.init = true;
        await User.saveUser(user);
    }
    else {
        log.info(`User did not provide a token or it was not valid`);
        log.info(`Creating a new user...`);
        user = new User({token: TokenGenerator.auth()});
        user.connection.connected = true;
        user.connection.init = false;
        await User.saveUser(user);

        log.info(`Sending token to user`);
        const ackToken = am.create(user);

        const message = eventManager.generate('init', {name: 'init', data: {setAuthToken: user.info.token}, ack: ackToken}, 'out');

        client.send(message);
    }

    client.on("message", (raw, isBinary) => {
        if (!user) {
            log.warn(`Received message from unauthenticated user`);
            return;
        }

        if (isBinary) {
            log.info(`Received binary message of ${raw.toString('hex').length/2} bytes`);
            return;
        }

        const data = raw.toString();
        const name = data.split(eventManager.padding)[0];

        if (!user.connection.init && name !== 'ack') {
            log.warn(`Received message from uninitialized user that was not completing init`);
            return;
        }

        eventManager.receive(name, data, client, db, user, am);

        log.debug(`Received message => "${data}"`);
    });

    client.on("close", () => {
        log.conn(`Client disconnected`);
        if (user) {
            user.connection.connected = false;
            user.connection.init = false;
        }
    });
});