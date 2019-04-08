/**
 * @author Alberto Mesin
 */
"use strict"

let Kinesis = require( "./lib/kinesis" );

let kns = new Kinesis();

kns.onReady().then( () => {
    kns.readFromStream( "test-stream" );
} );