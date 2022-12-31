import { WebSocket } from 'ws';
import { QuickDB } from 'quick.db';
import Ajv from "ajv/dist/jtd";
import path from 'path';
import fs from 'fs';

import { AuthToken } from './token';
import { User } from './user';
import { log } from './log';

const ajv = new Ajv();

type EventDirection = 'in' | 'out';

type EventDataPropertyType = "string" | "boolean" | "timestamp" | "int8" | "uint8" | "int16" | "uint16" | "int32" | "uint32" | "float32" | "float64";

type EventDataProperty = {
    type: EventDataPropertyType;
    nullable?: boolean;
}

type EventDataPropertyEnum = {
    enum: EventDataPropertyType[];
    nullable?: boolean;
}

type EventDataProperties = {
    [key: string]: EventDataProperty | EventDataPropertyEnum | EventDataProperties | EventDataFormat;
}

type EventDataFormat = {
    properties: EventDataProperties;
    optionalProperties?: EventDataProperties;
    additionalProperties?: boolean;
}

type EventInfo = {
    direction: EventDirection;
    name: string;
    format: EventDataFormat;
}

type ResponseOther = {
    direction: EventDirection;
    name: string;
    auth?: AuthToken;
};
type Response = (data: any, other: ResponseOther, socket: WebSocket, db: QuickDB, user: User) => void;

export class Event {
    info: EventInfo;
    subscriptions: Response[] = [];
    validate: any;
    serialize: any;
    parse: any;

    constructor(info: EventInfo) {
        this.info = info;

        const schema: EventDataFormat = {
            properties: {
                name: {
                    type: 'string'
                },
                ...(this.info.direction === 'in' && {auth: {type: 'string'}}),
                data: info.format
            },
            optionalProperties: {
                direction: {
                    type: 'string'
                },
                ack: {
                    type: 'string'
                },
            },
            additionalProperties: false
        };
        
        try {
            this.validate = ajv.compile(schema);
            this.serialize = ajv.compileSerializer(schema);
            this.parse = ajv.compileParser(schema);
        }
        catch (e) {
            log.error(`Failed to compile event validators for "${this.info.name}"`);
        }

    }

    subscribe(response: Response) {
        this.subscriptions.push(response);
    }
}

export class EventManager {
    private events: {
        in: Event[];
        out: Event[];
    } = {
        in: [],
        out: []
    };

    info: {
        sent: number;
        received: number;
        total: number;
    } = {
        sent: 0,
        received: 0,
        total: 0,
    };

    padding: string = "__";

    addEvent(event: Event, subscribe?: Response): Event | undefined {
        if (!this.getEventNames(event.info.direction).includes(event.info.name)) {
            this.events[event.info.direction].push(event);
            if (subscribe) {
                event.subscribe(subscribe);
            }
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

    subscribe(name: string, response: Response) {
        const event = this.getEvent('in', name);
        if (event) {
            event.subscribe(response);
        }
        else {
            log.warn(`Event "${name}" does not exist`);
        }
    }

    receive(name: string, raw: string, socket: WebSocket, db: QuickDB, user: User) {
        const event = this.getEvent('in', name);
        if (event) {
            const data = event.parse(raw);

            if (data === undefined) {
                log.warn(event.parse.message);
            }
            else {
                event.subscriptions.forEach((sub: Response) => sub(data.data, {direction: 'in', name: data.name, auth: data.auth}, socket, db, user));
                this.info.received++;
                this.info.total++;
            }
        }
        else {
            log.warn(`Event "${name}" does not exist`);
        }
    }

    generate(name: string, raw: any, direction: EventDirection = 'out'): string | undefined {
        const event = this.getEvent(direction, name);
        if (event) {
            if (event.validate(raw)) {
                
                delete raw?.direction;

                const data = event.serialize(raw);

                if (data !== undefined) {
                    this.info.sent++;
                    this.info.total++;
                    return raw.name + this.padding + data + this.padding;
                }
                else {
                    log.warn(event.serialize.message);
                }
            }
            else {
                log.warn(event.validate.errors.map((e) => `data ${e.message}`).join('\n'));
            }
        }
        else {
            log.warn(`Event "${name}" does not exist`);
        }
    }
}

export const eventManager = new EventManager();

(async () => {
    const eventPath = path.join(__dirname, 'events');

    const getAllFiles = (dir: string): string[] =>
        fs.readdirSync(dir).reduce((files, file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            return [...files, ...getAllFiles(filePath)];
        }
        if (stat.isFile() && file.endsWith('.ts')) {
            return [...files, filePath];
        }
        return files;
    }, []);

    const commandFiles = getAllFiles(eventPath);

    for (const file of commandFiles) {
        await import(file).then(event => {eventManager.addEvent(event.default)}).catch((e) => log.error(e));
    }
})();