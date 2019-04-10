/**
 * @author Alberto Mesin
 */
"use strict"

const DB = "./db.json";

let fs = require( "fs" );

class Persistance {
	static getData() {
		let data = {};
		if( fs.existsSync( DB ) ) {
			data = JSON.parse( fs.readFileSync( DB, "utf8" ) );
		}
		console.info( "PERS - readed: " + JSON.stringify( data ) );
		return data;
	}

	static setData( data ) {
		let JSONdata = JSON.stringify( data );
		fs.writeFileSync( DB, JSONdata, "utf8" );
		console.info( "PERS - Saved: " + JSONdata );
	}
}

module.exports = Persistance;