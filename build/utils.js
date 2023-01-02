"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.TokenGenerator = exports.getAddress = void 0;
// 3rd party dependencies
var nanoid_1 = require("nanoid");
var os_1 = require("os");
// local dependencies
var token_1 = require("./token");
var config_json_1 = __importDefault(require("./config.json"));
/**
 * Get the local IP address of the server
 * */
var getAddress = function () {
    var _a, _b;
    var nets = (0, os_1.networkInterfaces)();
    var results = Object.create(null);
    for (var _i = 0, _c = Object.keys(nets); _i < _c.length; _i++) {
        var name_1 = _c[_i];
        for (var _d = 0, _e = (_a = nets === null || nets === void 0 ? void 0 : nets[name_1]) !== null && _a !== void 0 ? _a : []; _d < _e.length; _d++) {
            var net = _e[_d];
            var familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name_1]) {
                    results[name_1] = [];
                }
                results[name_1].push(net.address);
            }
        }
    }
    return (_b = results === null || results === void 0 ? void 0 : results[config_json_1["default"].connection.interface]) === null || _b === void 0 ? void 0 : _b[0];
};
exports.getAddress = getAddress;
/**
 * Generate tokens of specific lengths
 * */
var TokenGenerator = /** @class */ (function () {
    function TokenGenerator() {
    }
    TokenGenerator.ack = function () {
        return (0, token_1.Token)((0, nanoid_1.nanoid)(5), 5);
    };
    TokenGenerator.room = function () {
        return (0, token_1.Token)((0, nanoid_1.nanoid)(8), 8);
    };
    TokenGenerator.auth = function () {
        return (0, token_1.Token)((0, nanoid_1.nanoid)(11), 11);
    };
    TokenGenerator.strong = function () {
        return (0, token_1.Token)((0, nanoid_1.nanoid)(21), 21);
    };
    return TokenGenerator;
}());
exports.TokenGenerator = TokenGenerator;
