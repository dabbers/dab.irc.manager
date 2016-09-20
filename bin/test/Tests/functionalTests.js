"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tsUnit = require('tsunit.external/tsUnit');
var Parser = require('dab.irc.parser/src/');
var Core = require('dab.irc.core/src');
var Manager = require('../../src');
var testSocket = (function () {
    function testSocket(cb) {
        process.nextTick(cb);
    }
    testSocket.prototype.setEncoding = function (enc) {
    };
    testSocket.prototype.on = function (event, cb) {
        if (event == "data")
            this.callback = cb;
    };
    testSocket.prototype.write = function (data) {
        this.callback(":user WROTE " + data + "\r\n");
    };
    testSocket.prototype.disconnect = function () {
    };
    return testSocket;
}());
var SampleIRCContext = (function () {
    function SampleIRCContext() {
        var _this = this;
        this.me = null;
        this.host = "irc.dab.biz";
        this.port = 6697;
        this.ssl = true;
        this.rejectUnauthedCerts = false;
        this.commandsFound = {};
        this.dataCallback = function (d) {
            _this.commandsFound[d.command] = (_this.commandsFound[d.command] || 0) + 1;
        };
        this.connectionEstablishedCallback = function (c) {
            c.write("NICK " + _this.me.nick);
            c.write("USER " + _this.me.ident + " 8 * :" + _this.me.name);
        };
        this.logSentMessages = true;
        this.logReceivedMessages = true;
    }
    SampleIRCContext.prototype.createConnection = function (cb) {
        this.socket = new testSocket(cb);
        return this.socket;
    };
    return SampleIRCContext;
}());
var FunctionalTests = (function (_super) {
    __extends(FunctionalTests, _super);
    function FunctionalTests() {
        _super.apply(this, arguments);
    }
    FunctionalTests.prototype.endToEndTest = function () {
        var _this = this;
        var data = ":kira.orbital.link NOTICE AUTH :*** Looking up your hostname...\r\n" +
            ":servr 001 dabirc :Welcome to the Orbital Link IRC Network dabirc!baditp@127.0.0.0\r\n" +
            ":servr 002 dabirc :Your host is servr, running version Unreal3.2.10.5\r\n" +
            ":servr 003 dabirc :This server was created Sat Sep 12 2015 at 04:46:47 EDT\r\n" +
            ":servr 004 dabirc navi.orbital.link Unreal3.2.10.5 iowghraAsORTVSxNCWqBzvdHtGpI lvhopsmntikrRcaqOALQbSeIKVfMCuzNTGjZ\r\n" +
            ":servr 005 dabirc CHANMODES=beI,kfL,lj,psmntirRcOAQKVCuzNSMTGZ STATUSMSG=~&@%+ :are supported by this server\r\n" +
            ":servr 005 dabirc CHANTYPES=# PREFIX=(qaohv)~&@%+ NETWORK=Orbital-Link CASEMAPPING=ascii EXTBAN=~,qjncrRa :are supported by this server\r\n" +
            ":servr 372 dabirc :-  Here is some generic MOTD message ok?\r\n" +
            ":servr 376 dabirc :End of /MOTD command.\r\n" +
            ":dabirc MODE dabirc :+iwxz\r\n" +
            ":dabirc!baditp@127.0.0.0 JOIN :#test\r\n" +
            ":servr 332 dabirc #test :channel topic would be here in a real channel maybe\r\n" +
            ":servr 333 dabirc #test dabirc2 1466217608\r\n" +
            ":servr 353 dabirc @ #test :dabirc &@dabirc2 ~@dabirc3\r\n" +
            ":servr 366 dabirc #test :End of /NAMES list.\r\n" +
            ":dabirc2!ident@host MODE #test +v dabirc\r\n" +
            ":dabirc!baditp@127.0.0.0 NICK :dabircA\r\n" +
            ":dabirc2!ident@host MODE #test -v dabircA\r\n" +
            ":dabircA!baditp@127.0.0.0 NICK :dabirc\r\n" +
            ":cribad!ident@127.0.0.0 JOIN :#test\r\n" +
            ":dabirc!baditp@127.0.0.0 PART #test :Goodbye message\r\n";
        var ctx = new SampleIRCContext();
        var connection = new Core.Connection();
        var manager = new Manager.ChannelManager();
        var me = new Core.User("dabirc", "dabitp", null);
        me.name = "dab.irc library";
        ctx.me = me;
        var svr = new Manager.ManagedServer(ctx, connection, undefined, manager);
        svr.on(Parser.Events.JOIN, function (s, m) {
            var msg = m;
            var length = Object.keys(manager.users.all).length;
            if (msg.from.display == "dabirc!dabitp@127.0.0.1") {
                _this.areIdentical(1, length);
            }
            else {
                _this.areIdentical(4, length);
            }
        });
        ctx.dataCallback = svr.dataReceived;
        connection.init(ctx);
        ctx.socket.callback(data);
    };
    return FunctionalTests;
}(tsUnit.TestClass));
exports.FunctionalTests = FunctionalTests;
//# sourceMappingURL=functionalTests.js.map