/**
 * @author Alberto Mesin
 */
"use strict"

let persistance = null;

let config = {
	kinesis: {
		//region: "eu-west-1",
		region: "papozze",
		endpoint: "http://localhost:4568",
		accessKeyId:  "fakeAccessKeyId",
		secretAccessKey: "fakeSecretAccessKey",
		sessionToken: "fakeSessionToken"
	},

	streams: [ {
		StreamName: "test-stream",
		ShardCount: 3
	} ],

	application: {
		waitBetweenDescribeCalls: 5, // in seconds.
		ShardIteratorType: "TRIM_HORIZON", // TODO: move; one per streams!
		persistence: persistance,
		persistanceTimeout: 5 // in seconds
	}
};

module.exports = config;