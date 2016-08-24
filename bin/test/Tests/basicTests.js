"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tsUnit = require('tsunit.external/tsUnit');
var Parser = require('dab.irc.parser/src');
var BasicTests = (function (_super) {
    __extends(BasicTests, _super);
    function BasicTests() {
        _super.call(this);
        this.servr = new Parser.ParserServer("a", null);
        this.servr.attributes["STATUSMSG"] = "~&@%+";
    }
    BasicTests.prototype.privmsgTest = function () {
    };
    return BasicTests;
}(tsUnit.TestClass));
exports.BasicTests = BasicTests;
