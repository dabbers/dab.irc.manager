"use strict";
const tsUnit = require('tsunit.external/tsUnit');
const Parser = require('dab.irc.parser/src');
const Core = require('dab.irc.core/src');
const Manager = require('../../src');
class TestContext {
    constructor() {
        this.me = new Core.User("dabirc", "ircident", null);
    }
    createConnection(cb) {
        return null;
    }
    connectionEstablishedCallback(c) {
        return null;
    }
}
class BasicTests extends tsUnit.TestClass {
    constructor() {
        super();
        this.servr = new Manager.ManagedServer("test", new TestContext(), new Core.Connection());
        this.servr.attributes = {
            CHANTYPES: '#',
            CHANMODES: 'beI,kfL,lj,psmntirRcOAQKVCuzNSMTGZ',
            STATUSMSG: '~&@%+',
            CHANMODES_A: 'beI',
            CHANMODES_B: 'kfL',
            CHANMODES_C: 'lj',
            CHANMODES_D: 'psmntirRcOAQKVCuzNSMTGZ',
            PREFIX: '(qaohv)~&@%+',
            NETWORK: 'Orbital-Link',
            CASEMAPPING: 'ascii',
            EXTBAN: '~,qjncrRa',
            PREFIX_MODES: 'qaohv',
            PREFIX_PREFIXES: '~&@%+'
        };
    }
    ManagedServerTest() {
        let cm = new Manager.ChannelManager();
        cm.register(this.servr);
        this.servr.emit(Parser.Events.JOIN, new Parser.ChannelUserChangeMessage(new Core.Message(":dabirc!ircident@host JOIN :#test\r\n")));
        this.areIdentical("#test", cm.channel["#test"].display);
        this.areIdentical("#test", cm.channels[0].display);
        this.servr.emit(Parser.Events.NICK, new Parser.NickChangeMessage(new Core.Message(":dabirc!ircident@host NICK :dabircA\r\n")));
        this.areIdentical("dabircA", this.servr.me.nick);
    }
}
exports.BasicTests = BasicTests;
//# sourceMappingURL=basicTests.js.map