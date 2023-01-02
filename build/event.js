"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.eventManager = exports.EventManager = exports.Event = void 0;
var jtd_1 = __importDefault(require("ajv/dist/jtd"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var log_1 = require("./log");
var ajv = new jtd_1["default"]();
var Event = /** @class */ (function () {
    function Event(info) {
        this.subscriptions = [];
        this.info = info;
        var schema = {
            properties: __assign(__assign({ name: {
                    type: 'string'
                } }, (this.info.direction === 'in' && { auth: { type: 'string' } })), { data: info.format }),
            optionalProperties: {
                direction: {
                    type: 'string'
                },
                ack: {
                    type: 'string'
                }
            },
            additionalProperties: false
        };
        try {
            this.validate = ajv.compile(schema);
            this.serialize = ajv.compileSerializer(schema);
            this.parse = ajv.compileParser(schema);
        }
        catch (e) {
            log_1.log.error("Failed to compile event validators for \"".concat(this.info.name, "\""));
        }
    }
    Event.prototype.subscribe = function (response) {
        this.subscriptions.push(response);
    };
    return Event;
}());
exports.Event = Event;
var EventManager = /** @class */ (function () {
    function EventManager() {
        this.events = {
            "in": [],
            out: []
        };
        this.info = {
            sent: 0,
            received: 0,
            total: 0
        };
        this.padding = "__";
    }
    EventManager.prototype.addEvent = function (event, subscribe) {
        if (!this.getEventNames(event.info.direction).includes(event.info.name)) {
            this.events[event.info.direction].push(event);
            if (subscribe) {
                event.subscribe(subscribe);
            }
            return event;
        }
    };
    EventManager.prototype.removeEvnet = function (event) {
        this.events[event.info.direction] = this.events[event.info.direction].filter(function (e) { return e.info.name !== event.info.name; });
    };
    EventManager.prototype.getEvent = function (direction, name) {
        return this.events[direction].find(function (event) { return event.info.name === name; });
    };
    EventManager.prototype.getEventNames = function (direction) {
        return this.events[direction].map(function (event) { return event.info.name; });
    };
    EventManager.prototype.subscribe = function (name, response) {
        var event = this.getEvent('in', name);
        if (event) {
            event.subscribe(response);
        }
        else {
            log_1.log.warn("Event \"".concat(name, "\" does not exist"));
        }
    };
    EventManager.prototype.receive = function (name, raw, socket, db, user, am) {
        var event = this.getEvent('in', name);
        if (event) {
            var data_1 = event.parse(raw);
            if (data_1 === undefined) {
                log_1.log.warn(event.parse.message);
            }
            else {
                event.subscriptions.forEach(function (sub) { return sub(data_1.data, { direction: 'in', name: data_1.name, auth: data_1.auth }, socket, db, user, am); });
                this.info.received++;
                this.info.total++;
            }
        }
        else {
            log_1.log.warn("Event \"".concat(name, "\" does not exist"));
        }
    };
    EventManager.prototype.generate = function (name, raw, direction) {
        if (direction === void 0) { direction = 'out'; }
        var event = this.getEvent(direction, name);
        if (event) {
            if (event.validate(raw)) {
                raw === null || raw === void 0 ? true : delete raw.direction;
                var data = event.serialize(raw);
                if (data !== undefined) {
                    this.info.sent++;
                    this.info.total++;
                    return raw.name + this.padding + data + this.padding;
                }
                else {
                    log_1.log.warn(event.serialize.message);
                }
            }
            else {
                log_1.log.warn(event.validate.errors.map(function (e) { return "data ".concat(e.message); }).join('\n'));
            }
        }
        else {
            log_1.log.warn("Event \"".concat(name, "\" does not exist"));
        }
    };
    return EventManager;
}());
exports.EventManager = EventManager;
exports.eventManager = new EventManager();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var eventPath, commandFiles, getFilesRecursively, _i, commandFiles_1, file;
    return __generator(this, function (_a) {
        var _b;
        switch (_a.label) {
            case 0:
                eventPath = path_1["default"].join(__dirname, 'events');
                commandFiles = [];
                getFilesRecursively = function (dir) {
                    var filesInDirectory = fs_1["default"].readdirSync(dir);
                    for (var _i = 0, filesInDirectory_1 = filesInDirectory; _i < filesInDirectory_1.length; _i++) {
                        var file = filesInDirectory_1[_i];
                        var absolute = path_1["default"].join(dir, file);
                        if (fs_1["default"].statSync(absolute).isDirectory()) {
                            getFilesRecursively(absolute);
                        }
                        else {
                            commandFiles.push(absolute);
                        }
                    }
                };
                getFilesRecursively(eventPath);
                _i = 0, commandFiles_1 = commandFiles;
                _a.label = 1;
            case 1:
                if (!(_i < commandFiles_1.length)) return [3 /*break*/, 4];
                file = commandFiles_1[_i];
                return [4 /*yield*/, (_b = file, Promise.resolve().then(function () { return __importStar(require(_b)); })).then(function (event) { exports.eventManager.addEvent(event["default"]); })["catch"](function (e) { return log_1.log.error(e); })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); })();
