"use strict";
exports.__esModule = true;
var event_1 = require("../../event");
var event = new event_1.Event({
    direction: 'out',
    name: 'init',
    format: {
        properties: {
            setAuthToken: {
                type: 'string'
            }
        }
    }
});
exports["default"] = event;
