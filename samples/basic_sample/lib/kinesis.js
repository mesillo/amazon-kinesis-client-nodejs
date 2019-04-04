/**
 * @author Alberto Mesin
 */
"use strict"

let AWS = require( "aws-sdk" );
let defaultConfig = require( "../conf/config" );

class Kinesis {
	constructor( config = null ) {
		this._init( config );
	}

	_init( config = null ) {
		if( ! config ) {
            this.config = defaultConfig;
        }
		this.kinesis = new AWS.Kinesis( this.config.kinesis ); //TODO: a try catch?!?!?
		this._streams = {};
		this._streamP = this._initStreams();
	}

	_initStream( params = null ) {
		if( ! params ) {
			return Promise.reject( new Error( "No parameters!" ) );
		}

		return new Promise( ( resolve, reject ) => {
			this.kinesis.createStream( params, ( error, data ) => {
				if( error ) {
					if( error.code !== "ResourceInUseException" ) {
						reject( error );
					}
					//TODO: Log something!
				}
				this._streams[ params.StreamName ] = {
					ShardCount: params.ShardCount,
					Active: this._whenActive( params.StreamName )
				};
				resolve();
			} );
	 	} );
	}

	_initStreams( params = null ) {
		if( ! params ) {
			params = this.config.streams;
		}

		let promises = [];

		for( let param of params ) {
			promises.push( this._initStream( param ) );
		}

		return Promise.all( promises );
	}

	_whenActive( StreamName ) {
		return new Promise( ( resolve, reject ) => {
			this._waitForStreamToBecomeActive( StreamName, resolve, reject );
		} );
	}

	_waitForStreamToBecomeActive( StreamName, resolve, reject ) {
		this.kinesis.describeStream( { StreamName: StreamName }, ( error, data ) => {
			if( error ) {
				reject( error );
			} else {
				if( data.StreamDescription.StreamStatus === "ACTIVE" ) {
					resolve( data );
				} else {
					setTimeout( () => {
						this._waitForStreamToBecomeActive( StreamName, resolve, reject );
					}, this.config.application.waitBetweenDescribeCalls * 1000 );
				}
			}
		} );
	}

	getStreams() {
		return this._streams;
	}
}

module.exports = Kinesis;