import { StrongToken } from "./token";
import { User } from "./user";
import { TokenGenerator } from "./utils";

type RoomOptions = {
    maxUsers: number;
    isPublic: boolean;
    state: 'joinable' | 'full' | 'closed';
}

export class Room {
    code: StrongToken;
    options: RoomOptions;
    users: User[];

    constructor(code: StrongToken, options: RoomOptions) {
        this.code = code;
        this.options = options;
        this.users = [];
    }

    addUser(user: User): boolean {
        if (this.options.state !== 'joinable') return false;

        this.users.push(user);
        user.room = this;

        if (this.users.length >= this.options.maxUsers) {
            this.options.state = 'full';
        }

        return true;
    }

    removeUser(user: User): boolean {
        const index = this.users.findIndex(u => u.info.token === user.info.token);
        if (index !== -1) {
            this.users.splice(index, 1);
            user.room = null;
            return true;
        }
        return false;
    }
}

class RoomManager {
    rooms: Room[] = [];

    createRoom(options: RoomOptions): Room {
        const code = TokenGenerator.room();
        const room = new Room(code, options);
        this.rooms.push(room);
        return room;
    }

    getRoom(code: StrongToken): Room | null {
        return this.rooms.find(room => room.code === code) || null;
    }

    deleteRoom(code: StrongToken): boolean {
        const index = this.rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            this.rooms.splice(index, 1);
            return true;
        }
        return false;
    }
}

