var aws = require('aws-lib')
var Promise = require('promise')

var productAdvertisingApi = aws.createProdAdvClient(accessKey, secretAccessKey, associateTag)

var lookupIsbn = Promise.denodeify(productAdvertisingApi.call.bind(productAdvertisingApi))

module.exports = function(isbn) {

	if (Array.isArray(isbn)) {
		isbn = isbn.join(',')
	}

	return lookupIsbn('ItemLookup', {
		ResponseGroup: 'Medium',
		SearchIndex: 'Books',
		IdType: 'ISBN',
		ItemId: isbn
	})
}
