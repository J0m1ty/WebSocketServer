// const EventTypes = ['in', 'out'] as const;

import { IValidatableProperties } from "./verifier";

// type EventType = typeof EventTypes[number];
type EventType = 'in' | 'out';

// const IncomingEventNames = ['ack'] as const;
// type IncomingEventName = typeof IncomingEventNames[number];
type IncomingEventName = 'ack';

// const OutgoingEventNames = ['ack', 'init'] as const;
// type OutgoingEventName = typeof OutgoingEventNames[number];
type OutgoingEventName = 'ack' | 'init';

export type EventName = IncomingEventName | OutgoingEventName;

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

interface IEventPayload {
    data: JSONValue;
    ackToken: string;
}

interface IEvent {
    type: EventType;
    name: EventName;
    payload: IEventPayload;
    format: IValidatableProperties;
}

interface IncomingPayload extends IEventPayload {
    authToken: string;
}

export interface IncomingEvent extends IEvent {
    type: 'in';
    payload: IncomingPayload;
}

export interface OutgoingEvent extends IEvent {
    type: 'out';
}

export type BaseEvent = IncomingEvent | OutgoingEvent;