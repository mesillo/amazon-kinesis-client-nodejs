/**
 * @author Alberto Mesin
 */
"use strict"

const DB = "./db.json";

let fs = require( "fs" );

class Persistance {
    static getData() {
        return JSON.parse( fs.readFileSync( DB, "utf8" ) );
    }

    static setData( data ) {

    }
}

module.exports = Persistance;