/**
 * @author Alberto Mesin
 */
"use strict"

let Kinesis = require( "./lib/kinesis" );

let kns = new Kinesis();

let index = 0;

kns.onReady().then( () => {
    setInterval( () => {
        kns.writeToStream( "test-stream",
                            Math.floor( Math.random() * 100000 ),
                            //{ scc: Math.floor( Math.random() * 10 ) }
                            { value: `${index++} => Rand: ${Math.floor( Math.random() * 10 )}` }
                            )
            .then( ( data ) => {
                console.log( `Writer: ${JSON.stringify( data )}` );
            } )
            .catch( ( error ) => {
                console.error( `Writer: ${JSON.stringify( error)}` );
            } );
    }, 1500 );
} );