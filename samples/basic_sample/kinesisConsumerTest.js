/**
 * @author Alberto Mesin
 */
"use strict"

let Kinesis = require( "./lib/kinesis" );

let kns = new Kinesis();

kns.onReady().then( () => {
    kns.readFromStream( "test-stream", ( records, readerId ) => {
        console.log( `${readerId} => ${records.length}` );
        for( let record of records ) {
            let data = record.Data.toString();
            console.log( `\t\t${data}` );
            //console.dir( record );
        }
    } );
} );