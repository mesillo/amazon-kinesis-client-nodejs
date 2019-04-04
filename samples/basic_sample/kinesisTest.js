/**
 * @author Alberto Mesin
 */
"use strict"

let Kinesis = require( "./lib/kinesis" );

let kns = new Kinesis();

//setTimeout( () => {
    console.log( kns.getStreams() );
//}, 10000 );

