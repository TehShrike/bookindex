var aws = require('aws-lib')
var Promise = require('promise')
var Bottleneck = require('bottleneck')

var config = require('../config')

var productAdvertisingApi = aws.createProdAdvClient(config.aws.accessKey, config.aws.secretAccessKey, config.aws.associateTag)
var lookupUnthrottled = productAdvertisingApi.call.bind(productAdvertisingApi)

var limiter = new Bottleneck(1, 1000)
var submitToListener = Promise.denodeify(limiter.submit.bind(limiter, lookupUnthrottled))

module.exports = function(isbn) {
	if (Array.isArray(isbn)) {
		isbn = isbn.join(',')
	}

	return submitToListener('ItemLookup', {
		ResponseGroup: 'Medium',
		SearchIndex: 'Books',
		IdType: 'ISBN',
		ItemId: isbn
	})
}
