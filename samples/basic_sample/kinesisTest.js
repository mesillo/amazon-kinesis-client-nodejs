/**
 * @author Alberto Mesin
 */
"use strict"

let Kinesis = require( "./lib/kinesis" );

let kns = new Kinesis();

//console.log( kns.getStreams() );
//setTimeout( () => {
//    console.log( kns.getStreams() );
//}, 10000 );
//kns.onReady().then( () => {
//    console.log( kns.getStreams() );
//} );
//kns.onReady().then( () => {
//    console.log( "HIT" );
//    kns.onStreamready( "test-stream" ).then( () => {
//        console.log( "... time to write!" );
//    } );
//} );
kns.onReady().then( () => {
    setInterval( () => {
        kns.writeToStream( "test-stream",
                            new Date().getTime() % 4,
                            { scc: Math.floor( Math.random() * 10 ) }
                            )
            .then( ( data ) => {
                console.log( `Writer: ${JSON.stringify( data )}` );
            } )
            .catch( ( error ) => {
                console.error( `Writer: ${JSON.stringify( error)}` );
            } );
    }, 1500 );
} );