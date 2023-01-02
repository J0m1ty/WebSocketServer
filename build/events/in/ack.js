"use strict";
exports.__esModule = true;
var event_1 = require("../../event");
var event = new event_1.Event({
    direction: 'in',
    name: 'ack',
    format: {
        properties: {
            ackToken: {
                type: 'string'
            }
        }
    }
});
exports["default"] = event;
