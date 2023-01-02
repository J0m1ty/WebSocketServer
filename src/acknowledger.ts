// local dependencies
import { log } from './log';
import { AckToken } from './token';
import { TokenGenerator } from './utils';
import { setTimeout } from 'timers/promises';
import { User } from './user';

/**
 * Waits a specified time for an acknowledgement, either succeeding quietly or calling a fail handler
 * */
export class Acknowledgment {
    state: 'pending' | 'waiting' | 'done' = 'pending';
    ac: AbortController = new AbortController();

    token: AckToken;
    ms: number;
    manager?: AcknowledgmentManager;

    constructor(init: {ms: number, token: AckToken, manager?: AcknowledgmentManager}) {
        this.ms = init.ms;
        this.token = init.token;
        this.manager = init.manager;
    }

    start() {
        if (this.state != 'pending') {return;}

        (async () => {
            this.state = 'waiting';
            
            await setTimeout(this.ms, null, { signal: this.ac.signal }).then(() => this.manager?.fail?.()).catch(e => {
                log.debug("ACKNOWLEDGED");
                console.log(e);
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

    create(user: User): AckToken {
        const newToken = TokenGenerator.ack();
        const at = new Acknowledgment({ms: this.timeout, token: newToken, manager: this});
        this.acks.add(at);
        at.start();
        return newToken;
    }

    resolve(token: AckToken): boolean {
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