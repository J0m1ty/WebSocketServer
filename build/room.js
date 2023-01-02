"use strict";
exports.__esModule = true;
exports.Room = void 0;
var utils_1 = require("./utils");
var Room = /** @class */ (function () {
    function Room(code, options) {
        this.code = code;
        this.options = options;
        this.users = [];
    }
    Room.prototype.addUser = function (user) {
        if (this.options.state !== 'joinable')
            return false;
        this.users.push(user);
        user.room = this;
        if (this.users.length >= this.options.maxUsers) {
            this.options.state = 'full';
        }
        return true;
    };
    Room.prototype.removeUser = function (user) {
        var index = this.users.findIndex(function (u) { return u.info.token === user.info.token; });
        if (index !== -1) {
            this.users.splice(index, 1);
            user.room = null;
            return true;
        }
        return false;
    };
    return Room;
}());
exports.Room = Room;
var RoomManager = /** @class */ (function () {
    function RoomManager() {
        this.rooms = [];
    }
    RoomManager.prototype.createRoom = function (options) {
        var code = utils_1.TokenGenerator.room();
        var room = new Room(code, options);
        this.rooms.push(room);
        return room;
    };
    RoomManager.prototype.getRoom = function (code) {
        return this.rooms.find(function (room) { return room.code === code; }) || null;
    };
    RoomManager.prototype.deleteRoom = function (code) {
        var index = this.rooms.findIndex(function (room) { return room.code === code; });
        if (index !== -1) {
            this.rooms.splice(index, 1);
            return true;
        }
        return false;
    };
    return RoomManager;
}());
