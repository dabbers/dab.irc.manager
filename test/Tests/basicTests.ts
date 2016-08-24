import tsUnit = require('tsunit.external/tsUnit');
import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';

export class BasicTests extends tsUnit.TestClass {
    private servr : Parser.ParserServer = new Parser.ParserServer("a", null);
    constructor() {
        super();

        this.servr.attributes["STATUSMSG"] = "~&@%+";
    }

    privmsgTest() {
        
    }
}