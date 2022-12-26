// 3rd party dependencies
import { createCheckers, CheckerT } from "ts-interface-checker";

// local dependencies
import { log } from './log';
import { BaseEvent } from './event';
import eventTI from './event-ti';
import verifierTI from './verifier-ti';

const checkers = createCheckers(eventTI, verifierTI) as {BaseEvent: CheckerT<BaseEvent>};

export class EventConverter {
    static parse(input: string): BaseEvent | null {
        if (!input.startsWith('__') || !input.endsWith('__')) {
            throw new Error('Invalid event string');
        }

        input = input.substring(2, input.length - 2);

        const result: unknown = JSON.parse(input);

        if (checkers.BaseEvent.test(result)) {
            log.debug("Successfully parsed event");
            return result;
        }
        else {
            let error = "Unknown error while parsing event";
            try {
                checkers.BaseEvent.check(result);
            }
            catch (e) {
                error = e.message;
            }
            log.error(error);
            return null;
        }
    }

    static stringify(input: BaseEvent): string {
        return '__' + JSON.stringify(input) + '__';
    }
}