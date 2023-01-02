"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.log = void 0;
// 3rd party dependencies
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
// local dependencies
var config_json_1 = __importDefault(require("./config.json"));
var logPath = path_1["default"].join(__dirname, config_json_1["default"].log.path);
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["SERVER"] = 1] = "SERVER";
    LogLevel[LogLevel["CONN"] = 2] = "CONN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["WARN"] = 4] = "WARN";
    LogLevel[LogLevel["ERROR"] = 5] = "ERROR";
})(LogLevel || (LogLevel = {}));
var LogColors;
(function (LogColors) {
    LogColors["DEBUG"] = "\u001B[97m";
    LogColors["SERVER"] = "\u001B[32m";
    LogColors["CONN"] = "\u001B[34m";
    LogColors["INFO"] = "\u001B[90m";
    LogColors["WARN"] = "\u001B[33m";
    LogColors["ERROR"] = "\u001B[31m";
})(LogColors || (LogColors = {}));
var Logger = /** @class */ (function () {
    function Logger(options) {
        var _a, _b;
        this.subscriptions = (_a = options.states) !== null && _a !== void 0 ? _a : Array.from({ length: Object.keys(LogLevel).length / 2 }, function (i) { return i = true; });
        this.maxLines = (_b = options.maxLines) !== null && _b !== void 0 ? _b : 100;
    }
    Logger.prototype.debug = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = message.map(function (m) { return m.toString(); });
        this.output(LogLevel.DEBUG, result.join(', '));
    };
    Logger.prototype.server = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = message.map(function (m) { return m.toString(); });
        this.output(LogLevel.SERVER, result.join(', '));
    };
    Logger.prototype.conn = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = message.map(function (m) { return m.toString(); });
        this.output(LogLevel.CONN, result.join(', '));
    };
    Logger.prototype.info = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = message.map(function (m) { return m.toString(); });
        this.output(LogLevel.INFO, result.join(', '));
    };
    Logger.prototype.warn = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = message.map(function (m) { return m.toString(); });
        this.output(LogLevel.WARN, result.join(', '));
    };
    Logger.prototype.error = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = message.map(function (m) { return m.toString(); });
        this.output(LogLevel.ERROR, result.join(', '));
    };
    Logger.prototype.output = function (level, message) {
        var file = "".concat(logPath, "log-").concat(new Date().toLocaleDateString('en-US').replace(/\//g, "_"), ".txt");
        var logMessage = "[".concat(LogLevel[level], "] ").concat(message);
        if (this.subscriptions[level]) {
            console.log("".concat(Object.values(LogColors)[level], "[").concat(LogLevel[level], "]\u001B[0m"), message);
        }
        if (this.maxLines <= 0) {
            (0, fs_1.appendFileSync)(file, logMessage, { flag: "a", encoding: "utf8" });
            return;
        }
        var lines = [];
        try {
            lines = (0, fs_1.readFileSync)(file, 'utf8').split('\n');
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
        lines.push(logMessage);
        if (lines.length > this.maxLines) {
            lines.shift();
        }
        (0, fs_1.writeFileSync)(file, lines.join('\n'), { flag: "w", encoding: "utf8" });
    };
    return Logger;
}());
/**
 * The Logger instance
 * */
exports.log = new Logger({ states: [config_json_1["default"].log.levels.debug, config_json_1["default"].log.levels.server, config_json_1["default"].log.levels.conn, config_json_1["default"].log.levels.info, config_json_1["default"].log.levels.warn, config_json_1["default"].log.levels.error], maxLines: config_json_1["default"].log.maxLines });
