// 3rd party dependencies
import { nanoid } from 'nanoid';
import { networkInterfaces } from 'os';

// local dependencies
import { Token, AuthToken, CallbackToken, StrongToken } from './token';

export const getAddress = (): string => {
    const nets = networkInterfaces();
    const results = Object.create(null);

    for (const name of Object.keys(nets)) {
        for (const net of nets?.[name] ?? []) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    return results?.['eth0']?.[0];
}

export class TokenGenerator {
    static callback(): CallbackToken {
        return Token(nanoid(5), 5);
    }

    static auth(): AuthToken {
        return Token(nanoid(11), 11);
    }

    static strong(): StrongToken {
        return Token(nanoid(21), 21);
    }
}