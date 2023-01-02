// local dependencies
import { db } from './database';
import { Room } from './room';
import { AuthToken } from './token';

type UserInfo = {
    token: AuthToken;
    username: string;
    color: string;
};

type Connection = {
    connected: boolean;
    init: boolean;
};

interface IUser {
    info: UserInfo;
    connection: Connection;
    room?: Room;
}

/**
 * A data structure that represents a user
 * */
export class User implements IUser {
    info: UserInfo;
    connection: Connection;
    room?: Room;

    constructor(info: Partial<UserInfo> & { token: AuthToken }) {
        this.info = {
            token: info.token,
            username: info.username ?? '',
            color: info.color ?? ''
        };
        this.connection = {
            connected: false,
            init: false
        };
        this.room = null;
    }

    static async fetchUser(token: string): Promise<UserInfo | null> {
        const users = await db.get<UserInfo[]>('users');
        const user = users.find(info => info.token === token);
        return user || null;
    }
    
    static async saveUser(user: User): Promise<void> {
        const users = await db.get<UserInfo[]>('users');
        const index = users.findIndex(info => info.token === user.info.token);
        if (index !== -1) {
            users[index] = user.info;
        }
        else {
            users.push(user.info);
        }
        await db.set('users', users);
    }
}
