// local dependencies
import { db } from './database';
import { AuthToken } from './token';

export type Connection = {
    connected: boolean;
    init: boolean;
};

export type UserInfo = {
    connection: Connection,
};

export interface IUser {
    token: AuthToken;
    info: UserInfo;
}

export class User implements IUser {
    token: AuthToken;
    info: UserInfo;

    constructor(token: AuthToken) {
        this.token = token;
        this.info = {
            connection: {
                connected: false,
                init: false
            }
        }
    }
    
    toJSON(): string {
        return JSON.stringify(this);
    }

    static async fetchUser(token: string): Promise<User | null> {
        const users = await db.get<User[]>('users');
        if (users) {
            const user = users.find(user => user.token === token);
            if (user) {
                return user;
            }
        }
        return null;
    }
    
    static async saveUser(user: User): Promise<void> {
        const users = await db.get<User[]>('users');
        if (users) {
            const index = users.findIndex(u => u.token === user.token);
            if (index !== -1) {
                users[index] = user;
                await db.set('users', users);
                return;
            }
        }
    }
}
