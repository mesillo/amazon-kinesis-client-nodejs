/**
 * @author Alberto Mesin
 */
"use strict"

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
		ShardCount: 2
	},
	{
		StreamName: "second-stupid-stream",
		ShardCount: 5
	} ],

	application: {
		waitBetweenDescribeCalls: 5 // in seconds.
	}
};

module.exports = config;