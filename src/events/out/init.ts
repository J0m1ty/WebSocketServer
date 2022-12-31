import { Event } from '../../event';

const event: Event = new Event({
    direction: 'out',
    name: 'init',
    format: {
        properties: {
            setAuthToken: {
                type: 'string'
            }
        }
    }
});

export default event;


