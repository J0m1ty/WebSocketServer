"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// local dependencies
var connection_1 = require("./connection");
var user_1 = require("./user");
var log_1 = require("./log");
var utils_1 = require("./utils");
var database_1 = require("./database");
var acknowledger_1 = require("./acknowledger");
var event_1 = require("./event");
Promise.resolve().then(function () { return __importStar(require('./event')); }).then(function () {
    event_1.eventManager.subscribe('ack', function (data, other, socket, db, user, am) { return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log_1.log.debug("Received ack for token ".concat(data.ackToken));
                    success = am.resolve(data.ackToken);
                    if (!success) return [3 /*break*/, 2];
                    user.connection.connected = true;
                    user.connection.init = true;
                    return [4 /*yield*/, user_1.User.saveUser(user)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
});
connection_1.ws.on("connection", function (client, req) { return __awaiter(void 0, void 0, void 0, function () {
    var am, searchParams, token, user, _a, _b, ackToken, message;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                am = new acknowledger_1.AcknowledgmentManager(5000, function () {
                    log_1.log.warn('Client did not acknowledge');
                    client.close(1000, 'Client response timed out');
                });
                log_1.log.conn("Client connected from ".concat((_c = req.socket.remoteAddress) === null || _c === void 0 ? void 0 : _c.replace('::ffff:', '')));
                searchParams = new URLSearchParams((_d = req.url) === null || _d === void 0 ? void 0 : _d.replace('/', ''));
                token = searchParams.get('token');
                if (!token) return [3 /*break*/, 2];
                _b = user_1.User.bind;
                return [4 /*yield*/, user_1.User.fetchUser(token)];
            case 1:
                _a = new (_b.apply(user_1.User, [void 0, _e.sent()]))();
                return [3 /*break*/, 3];
            case 2:
                _a = null;
                _e.label = 3;
            case 3:
                user = _a;
                if (!user) return [3 /*break*/, 5];
                log_1.log.info("Authenticated a user");
                user.connection.connected = true;
                user.connection.init = true;
                return [4 /*yield*/, user_1.User.saveUser(user)];
            case 4:
                _e.sent();
                return [3 /*break*/, 7];
            case 5:
                log_1.log.info("User did not provide a token or it was not valid");
                log_1.log.info("Creating a new user...");
                user = new user_1.User({ token: utils_1.TokenGenerator.auth() });
                user.connection.connected = true;
                user.connection.init = false;
                return [4 /*yield*/, user_1.User.saveUser(user)];
            case 6:
                _e.sent();
                log_1.log.info("Sending token to user");
                ackToken = am.create(user);
                message = event_1.eventManager.generate('init', { name: 'init', data: { setAuthToken: user.info.token }, ack: ackToken }, 'out');
                client.send(message);
                _e.label = 7;
            case 7:
                client.on("message", function (raw, isBinary) {
                    if (!user) {
                        log_1.log.warn("Received message from unauthenticated user");
                        return;
                    }
                    if (isBinary) {
                        log_1.log.info("Received binary message of ".concat(raw.toString('hex').length / 2, " bytes"));
                        return;
                    }
                    var data = raw.toString();
                    var name = data.split(event_1.eventManager.padding)[0];
                    if (!user.connection.init && name !== 'ack') {
                        log_1.log.warn("Received message from uninitialized user that was not completing init");
                        return;
                    }
                    event_1.eventManager.receive(name, data, client, database_1.db, user, am);
                    log_1.log.debug("Received message => \"".concat(data, "\""));
                });
                client.on("close", function () {
                    log_1.log.conn("Client disconnected");
                    if (user) {
                        user.connection.connected = false;
                        user.connection.init = false;
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
