/**
 * Based on https://cloudonaut.io/introducing-the-real-time-data-store-kinesis-streams/
 */
"use strict"

var AWS = require('aws-sdk');

var config = {
	kinesis : {
	  region : 'eu-west-1',
	  endpoint: "http://localhost:4568",
	  accessKeyId:  "fakeAccessKeyId",
	  secretAccessKey: "fakeSecretAccessKey",
	  sessionToken: "fakeSessionToken"
	},

	sampleConsume : {
		stream : 'iot-raw-messages'
	}
};

var kinesis = new AWS.Kinesis( config.kinesis );

kinesis.describeStream({
  //StreamName: 'cloudonaut-stream'
  StreamName: config.sampleConsume.stream
}, function(err, streamData) {
  if (err) {
	console.log(err, err.stack); // an error occurred
  } else {
	console.log(streamData); // successful response
	streamData.StreamDescription.Shards.forEach(shard => {
	  kinesis.getShardIterator({
		ShardId: shard.ShardId,
		ShardIteratorType: 'TRIM_HORIZON',
		//StreamName: 'cloudonaut-stream'
		StreamName: config.sampleConsume.stream
	  }, function(err, shardIteratordata) {
		if (err) {
		  console.log(err, err.stack); // an error occurred
		} else {
		  console.log(shardIteratordata); // successful response
		  kinesis.getRecords({
			ShardIterator: shardIteratordata.ShardIterator
		  }, function(err, recordsData) {
			if (err) {
			  console.log(err, err.stack); // an error occurred
			} else {
			  console.log(recordsData); // successful response
			}
		  });
		}
	  });
	});
  }
});