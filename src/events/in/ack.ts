import { Event } from '../../event';

const event: Event = new Event({
    direction: 'in',
    name: 'ack',
    format: {
        properties: {
            ackToken: {
                type: 'string'
            }
        }
    }
});

export default event;