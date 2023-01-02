"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.db = void 0;
// 3rd party dependencies
var quick_db_1 = require("quick.db");
var path_1 = __importDefault(require("path"));
// local dependencies
var config_json_1 = __importDefault(require("./config.json"));
/**
 * The database instance
 * */
exports.db = new quick_db_1.QuickDB({ filePath: path_1["default"].join(__dirname, config_json_1["default"].database.path) });
