"use strict";
exports.__esModule = true;
exports.Token = void 0;
var isStringOfLength = function (str, len) { return str.trim().length == len; };
/**
 * A generator for a token of a specified length
 * */
var Token = function (input, length) {
    if (!isStringOfLength(input, length)) {
        throw new Error("Input is not between specified length or contains whitespace");
    }
    return input;
};
exports.Token = Token;
