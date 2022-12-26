// local dependencies
import { ws } from './connection';
import { User } from './user';
import { log } from './log';
import { TokenGenerator, ClientReferences } from './utils';
import { EventConverter } from './events';

import { IncomingEvent, OutgoingEvent, EventName, BaseEvent } from './event';
import { AcknowledgmentManager } from './acknowledger';
import { AuthToken, CallbackToken } from './token';
import { IValidatableProperties, ValidatableEvent } from './verifier';

const am = new AcknowledgmentManager(2500, () => {
    log.error("HANDLE TIMEOUT");
});

// testing below
class IncomingAckEvent implements IncomingEvent {
    type: "in" = "in";
    name: "ack" = "ack";

    payload: {
        data: {callbackToken: CallbackToken};
        ackToken: CallbackToken;
        authToken: AuthToken;
    }
    
    format: IValidatableProperties = {callbackToken:{type:"string", minLength: 5, maxLength: 5}};

    constructor(callbackToken: CallbackToken) {
        this.payload = {
            data: {callbackToken: callbackToken},
            ackToken: TokenGenerator.callback(),
            authToken: TokenGenerator.auth()
        }
    }
}

const myEvent = new IncomingAckEvent(TokenGenerator.callback());

const stringy = EventConverter.stringify(myEvent);
console.log(stringy);

const back = EventConverter.parse(stringy);
console.log(back);

if (back) {
    if (back.type == "in") {
        // use back.name as an IncomingEventName to get repsective event
        const respectiveEvent = new IncomingAckEvent(TokenGenerator.callback());
        
        const validator = new ValidatableEvent(back.name, respectiveEvent.format, false);

        if (validator.validate(back.payload.data)) {
            const data = back.payload.data as typeof respectiveEvent.payload.data;
    
            // now can safely get data results
            console.log(data.callbackToken);
        }
        else {
            log.error(validator.validate.errors.map((e, i) => `#${i + 1}: data ${e.message}`).join('\n'));
        }
    }
}

ws.on("connection", async (client, req) => {
    log.conn(`Client connected from ${req.socket.remoteAddress?.replace('::ffff:', '')}`);
    const searchParams = new URLSearchParams(req.url?.replace('/', ''));
    const token = searchParams.get('token');

    let user: Readonly<User> | null = token ? await User.fetchUser(token) : null;
    if (user) {
        log.info(`Authenticated a user`);
        user.info.connection.connected = true;
        user.info.connection.init = true;
    }
    else {
        log.info(`User did not provide a token or it was not valid`);
        log.info(`Creating a new user...`);
        user = new User(TokenGenerator.auth());
        user.info.connection.connected = true;
        user.info.connection.init = false;
        await User.saveUser(user);

        log.info(`Sending token to user...`);
        // const callbackToken = am.create();

        // const newEvent: OutgoingEvent = {
        //     type: 'out',
        //     name: 'init',
        //     payload: {
        //         data: {token: user.token},
        //         format: {token: {type: "string", minLength: 11, maxLength: 11}},
        //         ackToken: callbackToken,
        //     }
        // };

        // const result = EventConverter.stringify(newEvent);

        // if (result) {
        //     client.send(result);
        //     log.debug(`Sent token...`);
        // }
    }

    client.on("message", (data, isBinary) => {
        if (!user) {
            log.warn(`Received message from unauthenticated user`);
            return;
        }

        if (isBinary) {
            log.info(`Received binary message of ${data.toString('hex').length/2} bytes`);
            return;
        }

        log.info(`Received message => "${data}"`);
    });

    client.on("close", () => {
        log.conn(`Client disconnected`);
        if (user) {
            user.info.connection.connected = false;
            user.info.connection.init = false;
        }
    });
});