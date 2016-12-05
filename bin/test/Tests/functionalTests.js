"use strict";
const tsUnit = require('tsunit.external/tsUnit');
const Parser = require('dab.irc.parser/src/');
const Core = require('dab.irc.core/src');
const Manager = require('../../src');
class testSocket {
    constructor(cb) {
        process.nextTick(cb);
    }
    setEncoding(enc) {
    }
    on(event, cb) {
        if (event == "data")
            this.callback = cb;
    }
    write(data) {
        process.nextTick(function (cb) { return function () { cb(":user WROTE " + data + "\r\n"); }; }(this.callback));
    }
    disconnect() {
    }
}
class SampleIRCContext {
    constructor() {
        this.me = null;
        this.host = "irc.dab.biz";
        this.port = 6697;
        this.ssl = true;
        this.rejectUnauthedCerts = false;
        this.commandsFound = {};
        this.dataCallback = (d) => {
            this.commandsFound[d.command] = (this.commandsFound[d.command] || 0) + 1;
        };
        this.connectionEstablishedCallback = (c) => {
            c.write("NICK " + this.me.nick);
            c.write("USER " + this.me.ident + " 8 * :" + this.me.name);
        };
        this.logSentMessages = false;
        this.logReceivedMessages = false;
    }
    createConnection(cb) {
        this.socket = new testSocket(cb);
        return this.socket;
    }
}
class FunctionalTests extends tsUnit.TestClass {
    constructor() {
        super(...arguments);
        this.endToEndJoinCount = 0;
    }
    endToEndTest() {
        let data = ":kira.orbital.link NOTICE AUTH :*** Looking up your hostname...\r\n" +
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
        let ctx = new SampleIRCContext();
        let connection = new Core.Connection();
        let manager = new Manager.ChannelManager();
        let me = new Core.User("dabirc", "dabitp", null);
        me.name = "dab.irc library";
        ctx.me = me;
        let svr = new Manager.ManagedServer("test", ctx, connection, undefined, manager);
        svr.on(Parser.Events.JOIN, (s, m) => {
            let msg = m;
            let length = Object.keys(manager.users.all).length;
            if (msg.from.display == "dabirc!baditp@127.0.0.0") {
                this.areIdentical(1, length);
            }
            else {
                this.areIdentical(4, length);
            }
        });
        svr.on(Parser.Events.PART, (s, m) => {
            this.areIdentical(m.from.display, "dabirc!baditp@127.0.0.0");
        });
        svr.on(Parser.ExEvent.create(Parser.Events.JOIN, "#test"), (s, m) => {
            this.endToEndJoinCount++;
        });
        ctx.dataCallback = svr.dataReceived;
        connection.init(ctx);
        ctx.socket.callback(data);
        this.areIdentical(2, this.endToEndJoinCount, "Join count for specialized join callback not equal");
        this.areIdentical(0, Object.keys(manager.channels).length);
    }
}
exports.FunctionalTests = FunctionalTests;
//# sourceMappingURL=functionalTests.js.map