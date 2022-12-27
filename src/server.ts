// local dependencies
import { ws } from './connection';
import { User } from './user';
import { log } from './log';
import { TokenGenerator } from './utils';

import { AcknowledgmentManager } from './acknowledger';

const am = new AcknowledgmentManager(2500, () => {
    log.error("HANDLE TIMEOUT");
});

// testing below
type EventDirection = 'in' | 'out';

type EventDataPropertyType = "number" | "integer" | "string" | "boolean" | "array" | "null" | "object";

type EventDataProperty = {
    type: EventDataPropertyType;
    nullable?: boolean;
    required?: boolean;
}

type EventDataStringProperty = EventDataProperty & {
    type: "string";
    minLength?: number;
    maxLength?: number;
}

type EventDataNumberProperty = EventDataProperty & {
    type: "number";
    minimum?: number;
    maximum?: number;
}

type EventDataFormat = {
    [key: string]: EventDataProperty | EventDataStringProperty | EventDataNumberProperty;
}

type EventInfo = {
    direction: EventDirection;
    name: string;
    format: EventDataFormat;
}

class Event {
    info: EventInfo;
    subscriptions: ((data: any) => void)[] = [];
    validate: any;

    constructor(info: EventInfo) {
        this.info = info;

        const schema = {
            type: "object",
            properties: {},
            required: [] as string[],
            additionalProperties: false
        };

        Object.entries(this.info.format).forEach(([key, value]) => {
            if (value.required) {
                schema.required.push(key);
                delete value.required;
            }

            schema.properties[key] = value;
        });

        try {
            this.validate = ajv.compile(schema);
        }
        catch (e) {
            log.error(`Failed to compile event format for ${this.info.name}`);
            throw e;
        }
    }

    subscribe(response: (data: any) => void) {
        this.subscriptions.push(response);
    }
}

import Ajv from "ajv";
import { AuthToken } from './token';
const ajv = new Ajv();

class EventManager {
    private events: {
        in: Event[];
        out: Event[];
    } = {
        in: [],
        out: []
    };

    addEvent(event: Event): Event | undefined {
        if (!this.getEventNames(event.info.direction).includes(event.info.name)) {
            this.events[event.info.direction].push(event);
            return event;
        }
    }

    removeEvnet(event: Event) {
        this.events[event.info.direction] = this.events[event.info.direction].filter((e: Event) => e.info.name !== event.info.name);
    }

    getEvent(direction: EventDirection, name: string): Event | undefined {
        return this.events[direction].find((event: Event) => event.info.name === name);
    }

    getEventNames(direction: EventDirection) {
        return this.events[direction].map((event: Event) => event.info.name);
    }

    subscribe(name: string, response: (data: any) => void) {
        const event = this.getEvent('in', name);
        if (event) {
            event.subscriptions.push(response);
        }
    }

    run(name: string, data: any = null): boolean {
        const event = this.getEvent('in', name);
        if (event) {
            if (event.validate(data)) {
                event.subscriptions.forEach((sub: (data: any) => void) => sub(data));
                return true;
            }
            else {
                log.error(event.validate.errors.map((e) => `data ${e.message}`).join('\n'));
            }
        }
        return false;
    }
}

const eventManager = new EventManager();

eventManager.addEvent(new Event({
    direction: 'in',
    name: 'ack',
    format: {
        ackToken: {
            type: 'string',
            minLength: 5,
            maxLength: 5,
            required: true
        },
        authToken: {
            type: 'string',
            minLength: 11,
            maxLength: 11,
            required: true
        }
    }
}));

eventManager.subscribe('ack', (data: any) => {
    log.info(`Received ack for token ${data.ackToken}`);
});

eventManager.run('ack', {ackToken: '12345'});
eventManager.run('ack', {ackToken: '123456'});
eventManager.run('ack', {whaaaa: '12345'});

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

        log.info(`Sending token to user`);
        const callbackToken = am.create();
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