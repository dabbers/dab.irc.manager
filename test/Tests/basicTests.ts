import tsUnit = require('tsunit.external/tsUnit');
import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import * as Manager from '../../src';

class TestContext implements Core.IConnectionContext {
    me: Core.User = new Core.User("dabirc", "ircident", null);
    
    host: string;
    port: number;
    ssl: boolean;
    rejectUnauthedCerts: boolean;

    dataCallback: (d: Core.Message) => {
    }

    createConnection(cb:() => any): Core.ISocket {
        return null;
    }

    connectionEstablishedCallback (c: Core.Connection) :any {
        return null;
    }
    
    logSentMessages: boolean;
    logReceivedMessages: boolean;
    channelPrefixes:string[];
}

export class BasicTests extends tsUnit.TestClass {
    private servr : Manager.ManagedServer = new Manager.ManagedServer(
        "test",
        new TestContext(),
        new Core.Connection()
    );
    
    constructor() {
        super();

        //this.servr.attributes["STATUSMSG"] = "~&@%+";
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

        this.servr.emit(
            Parser.Events.JOIN, 
            new Parser.ChannelUserChangeMessage(
                new Core.Message(":dabirc!ircident@host JOIN :#test\r\n")
            )
        );

        this.areIdentical("#test", cm.channel["#test"].display);
        this.areIdentical("#test", cm.channels[0].display);
        
        this.servr.emit(
            Parser.Events.NICK, 
            new Parser.NickChangeMessage(
                new Core.Message(":dabirc!ircident@host NICK :dabircA\r\n")
            )
        );

        this.areIdentical("dabircA", this.servr.me.nick); 
    }
}