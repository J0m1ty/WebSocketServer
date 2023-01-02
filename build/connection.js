"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ws = void 0;
// 3rd party dependencies
var fs_1 = require("fs");
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
var express_1 = __importDefault(require("express"));
var ws_1 = require("ws");
// local dependencies
var utils_1 = require("./utils");
var log_1 = require("./log");
var config_json_1 = __importDefault(require("./config.json"));
// express app
var app = (0, express_1["default"])();
// the HTTP or HTTPS server
var port = config_json_1["default"].connection.port;
var server = config_json_1["default"].connection.secure ? https_1["default"].createServer({
    cert: (0, fs_1.readFileSync)(config_json_1["default"].connection.cert, 'utf8'),
    key: (0, fs_1.readFileSync)(config_json_1["default"].connection.privkey, 'utf8')
}, app) : http_1["default"].createServer(app);
// start server
server.listen(port, function () {
    log_1.log.server("Server started on ".concat((0, utils_1.getAddress)(), ":").concat(port));
});
// server single-page application for debugging
app.get('/', function (req, res) {
    res.send("Multiplayer game server for https://".concat((0, utils_1.getAddress)(), ":").concat(port));
});
/**
 * The WebSocket server instance
 * */
exports.ws = new ws_1.WebSocketServer({ server: server });
