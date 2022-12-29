// local dependencies
import { log } from './log';
import { CallbackToken } from './token';
import { TokenGenerator } from './utils';

/**
 * Creates a cancelable timeout
 * */
export const delay = (ms: number, value: unknown, { signal }) => {
    return new Promise((resolve, reject) => {
        const listener = () => {
            clearTimeout(timer);
            reject(signal.reason);
        };
        signal?.throwIfAborted();
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', listener);
            resolve(value);
        }, ms);
        signal?.addEventListener('abort', listener);
    });
}

/**
 * Waits a specified time for an acknowledgement, either succeeding quietly or calling a fail handler
 * */
export class Acknowledgment {
    state: 'pending' | 'waiting' | 'done' = 'pending';
    ac: AbortController = new AbortController();

    token: CallbackToken;
    ms: number;
    manager?: AcknowledgmentManager;

    constructor(init: {ms: number, token: CallbackToken, manager?: AcknowledgmentManager}) {
        this.ms = init.ms;
        this.token = init.token;
        this.manager = init.manager;
    }

    start() {
        if (this.state != 'pending') {return;}

        (async () => {
            this.state = 'waiting';

            await delay(this.ms, null, { signal: this.ac.signal }).then(() => this.manager?.fail?.()).catch(e => {
                log.debug("ACKNOWLEDGED");
            }).finally(() => {
                this.state = 'done';
                this.manager?.delete(this);
            });
        })();
    }

    acknowledge(): boolean {
        if (this.state == 'waiting') {
            this.ac.abort();
            return true;
        }
        return false;
    }
}

/**
 * Manager for creating acknowledgments
 * */
export class AcknowledgmentManager {
    acks: Set<Acknowledgment> = new Set();
    timeout: number;
    fail?: () => void;

    constructor(timeout: number = 2500, fail?: () => void) {
        this.timeout = timeout;
        this.fail = fail;
    }

    create(): CallbackToken {
        const newToken = TokenGenerator.callback();
        const at = new Acknowledgment({ms: this.timeout, token: newToken, manager: this});
        this.acks.add(at);
        at.start();
        return newToken;
    }

    resolve(token: CallbackToken): boolean {
        let found = Array.from(this.acks).find(t => t.token == token);
        if (found) {
            found.acknowledge();
            return true;
        }
        return false;
    }

    delete(at: Acknowledgment): boolean {
        return this.acks.delete(at);
    }
}