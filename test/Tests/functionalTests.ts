import tsUnit = require('tsunit.external/tsUnit');
import * as Parser from 'dab.irc.parser/src/';
import * as Core from 'dab.irc.core/src';
import * as Manager from '../../src';

class testSocket implements Core.ISocket {
    constructor(cb:() => any) {
        process.nextTick(cb);
    }
    setEncoding(enc: string) : void {

    }

    on(event: string, cb : Function) : void {
        if (event == "data")
            this.callback = cb;
    }

    write(data:  string) : void {
        this.callback(":user WROTE " + data + "\r\n");
    }
    
    disconnect() : void {

    }

    callback : Function;
}

class SampleIRCContext implements Core.IConnectionContext {
    connection: Core.Connection;
    me: Core.User = null;
    
    host: string = "irc.dab.biz";
    port: number = 6697;
    ssl: boolean = true;
    rejectUnauthedCerts: boolean = false;

    socket : testSocket;

    onConnect : () => any;

    constructor() {
    }

    commandsFound : {[cmd: string ] :  number} = {};

    dataCallback: (d: Core.Message) => any = (d:Core.Message) => {
        this.commandsFound[d.command] = (this.commandsFound[d.command] || 0) + 1; 
    };

    createConnection(cb:() => any): Core.ISocket {
        this.socket = new testSocket(cb);
        //this.onConnect = cb;
        return this.socket;
    }

    connectionEstablishedCallback: (c:Core.Connection) => any = (c:Core.Connection) => {  
        c.write("NICK " + this.me.nick);
        c.write("USER " + this.me.ident + " 8 * :" + this.me.name);
    }

    logSentMessages: boolean = true;
    logReceivedMessages: boolean = true;
    
    channelPrefixes:string[];
}


export class FunctionalTests extends tsUnit.TestClass {


    endToEndTest() : void {
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
            ":servr 333 dabirc #test dabirc2 1466217608\r\n" + // Timestamp for channel topic set and who set it
            ":servr 353 dabirc @ #test :dabirc &@dabirc2 ~@dabirc3\r\n" + // normally we'd need to enable multi prefix, but for the test pretend it was
            ":servr 366 dabirc #test :End of /NAMES list.\r\n" +
            ":dabirc2!ident@host MODE #test +v dabirc\r\n" +
            ":dabirc!baditp@127.0.0.0 NICK :dabircA\r\n" +
            ":dabirc2!ident@host MODE #test -v dabircA\r\n" +
            ":dabircA!baditp@127.0.0.0 NICK :dabirc\r\n" +
            ":cribad!ident@127.0.0.0 JOIN :#test\r\n" +
            ":dabirc!baditp@127.0.0.0 PART #test :Goodbye message\r\n" /*+
            "\r\n" +
            "\r\n" +
            "\r\n" +
            "\r\n" +
            "\r\n" +
            "\r\n" +
            "\r\n" +
            "\r\n"*/ 
            ;

        let ctx = new SampleIRCContext();
        let connection = new Core.Connection();
        let manager = new Manager.ChannelManager();

        let me = new Core.User("dabirc", "dabitp", null);
        me.name = "dab.irc library";
        ctx.me = me;

        let svr = new Manager.ManagedServer(ctx, connection, undefined, manager);

        svr.on(Parser.Events.JOIN, (s:Parser.ParserServer, m:Core.Message) => {
            let msg = <Parser.ChannelUserChangeMessage>m;
            let length = Object.keys(manager.users.all).length;

            if (msg.from.display == "dabirc!dabitp@127.0.0.1") {
                // no users should be in here but ourselves?
                this.areIdentical(1, length);
            }
            else {
                // technically the server event should have executed first, so we should already have an updated user count
                this.areIdentical(4, length);
            }
        });
        
        ctx.dataCallback = svr.dataReceived;

        connection.init(ctx); 

        // send data to "socket"
        ctx.socket.callback(data);


    }

}