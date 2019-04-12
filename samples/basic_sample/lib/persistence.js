/**
 * @author Alberto Mesin
 */
"use strict"

const DB = "./db.json";
const loginfo = false;

let fs = require( "fs" );

class Persistance {
	static getData() {
		let data = {};
		if( fs.existsSync( DB ) ) {
			data = JSON.parse( fs.readFileSync( DB, "utf8" ) );
		}
		if( loginfo ) console.info( "PERS - Readed: " + JSON.stringify( data ) );
		return data;
	}

	static setData( data ) {
		let JSONdata = JSON.stringify( data );
		fs.writeFileSync( DB, JSONdata, "utf8" );
		if( loginfo ) console.info( "PERS - Saved: " + JSONdata );
	}
}

module.exports = Persistance;