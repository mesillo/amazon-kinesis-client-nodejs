/**
 * @author Alberto Mesin
 */
"use strict"
//TODO: recovering... pain in the arse...
let AWS = require( "aws-sdk" );
let defaultConfig = require( "../conf/config" );

class Kinesis {
	constructor( config = null ) {
		this._init( config );
	}

	_init( config = null ) { //TODO: refactoring in more Promise-Style???
		if( ! config ) {
            this.config = defaultConfig;
        }
		this.kinesis = new AWS.Kinesis( this.config.kinesis ); //TODO: a try catch?!?!?
		this._streams = {};
		this._initReaderStatus();
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

	_initReaderStatus() {
		let persistence = this.config.application.persistence;
		this._setStatus( {} );
		if( persistence ) {
			this._setStatus( persistence.getData() );
		}
		let millis = this.config.application.persistanceTimeout * 1000;
		if( millis ) {
			setInterval( () => { this._saveReaderStatus(); }, millis );
		}
	}

	_saveReaderStatus() {
		let persistence = this.config.application.persistence;
		if( persistence ) {
			persistence.setData( this._getStatus() );
		}
	}

	_setStatus( data ) {
		this._status = data;
	}

	_getStatus() {
		return this._status;
	}

	_getStreamStatus( StreamName ) {
		let status = this._getStatus()[ StreamName ];
		if( ! status ) {
			status = {};
		}
		return status;
	}

	_setStreamStatus( StreamName, status ) {
		this._getStatus()[ StreamName ] = status;
		return status;
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

	getStream( StreamName ) {
		return this._streams[ StreamName ];
	}

	onStreamready( StreamName ) {
		let streamInfo = this.getStream( StreamName );
		if( typeof streamInfo === "object" ) { // TODO: Is enough? Need to search in config?
			return streamInfo.Active;
		} else {
			return Promise.reject( "Not initialized yet." );
		}
	}

	onReady() {
		return this._streamP;
	}

	writeToStream( StreamName, PartitionKey, Data ) {
		return new Promise( ( resolve, reject ) => {
			this.onReady().then( () => {
				this.onStreamready( StreamName ).then( () => {
					let recordParams = {
						Data: typeof Data === "string" ? Data : JSON.stringify( Data ),
    					PartitionKey: typeof PartitionKey === "string" ? PartitionKey : PartitionKey.toString(),
    					StreamName: StreamName
					};

					this.kinesis.putRecord( recordParams, ( error, data ) => { //TODO: use putRecors... more redords more efficiency
						if( error ) {
							reject( error );
						} else {
							resolve( data );
						}
					} );
				} );
			} );
		} );
	}

	getStreamsIterators( StreamName ) {
		return new Promise( ( resolve, reject ) => {
			this.onReady().then( () => {
				this.onStreamready( StreamName ).then( ( StreamDescription ) => {
					let shards = StreamDescription.StreamDescription.Shards;
					let iterators = [];
					for( let shard of shards ) {
						let promise = new Promise( ( resolve, reject ) => {
							let iteratorParameters = {
								ShardId: shard.ShardId,
								ShardIteratorType: this.config.application.ShardIteratorType,
								StreamName: StreamName
							};
							this.kinesis.getShardIterator( iteratorParameters, ( error, shardIteratordata ) => {
								if( error ) {
									reject( error );
								} else {
									resolve( shardIteratordata );
								}
							} );
						} );
						iterators.push( promise );
					}

					return Promise.all( iterators )
						.then( ( data ) => {
							resolve( data );
						} ).catch( ( error ) => {
							reject( error );
						} );
				} );
			} );
		} );
	}

	readFromStream( StreamName, dataProcessor = ( data, rId ) => {} ) {
		let streamStatus = this._setStreamStatus( StreamName, this._getStreamStatus( StreamName ) );
		let streamStatusKeys = Object.keys( streamStatus );
		if( streamStatusKeys.length ) {
			let iterators = [];
			for( let key of streamStatusKeys ) {
				iterators.push( {
					ShardIterator: streamStatus[ key ]
				} );
			}
		} else {
			this.getStreamsIterators( StreamName )
				.then( ( iterators ) => {
					this._startIteratorsReaders( iterators, dataProcessor );
				} );
		}
	}

	_startIteratorsReaders( iterators, dataProcessor ) {
		let readerId = 0;
		for( let iterator of iterators ) {
			this._readFromIterator( readerId++, iterator.ShardIterator, dataProcessor );
		}
	}

	_readFromIterator( shardId, iterator, dataProcessor ) {
		let recordParams = {
			ShardIterator: iterator
		};

		this.kinesis.getRecords( recordParams, ( error, recordsData ) => {
			if( error ) {
				throw new Error( error.message ); // TODO: Improve This code!!!
			} else {
				if( recordsData.Records.length ) {
					dataProcessor( recordsData.Records, shardId );
				}
				//// call another istance ////
				let nextShardIterator = recordsData.NextShardIterator;
				if( nextShardIterator ) {
					this._readFromIterator( shardId, nextShardIterator, dataProcessor );
				} // TODO: else.
			}
		} );
	}
}

module.exports = Kinesis;