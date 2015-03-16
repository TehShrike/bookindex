var aws = require('aws-lib')
var Promise = require('promise')
var Bottleneck = require('bottleneck')

var config = require('../config')

var productAdvertisingApi = aws.createProdAdvClient(config.aws.accessKey, config.aws.secretAccessKey, config.aws.associateTag)
var lookupUnthrottled = productAdvertisingApi.call.bind(productAdvertisingApi)

var limiter = new Bottleneck(1, 1000)
var submitToListener = Promise.denodeify(limiter.submit.bind(limiter, lookupUnthrottled))

function lookup(isbn) {
	if (Array.isArray(isbn)) {
		isbn = isbn.join(',')
	}

	return submitToListener('ItemLookup', {
		ResponseGroup: 'Medium',
		SearchIndex: 'Books',
		IdType: 'ISBN',
		ItemId: isbn
	}).then(function(result) {
		return result.Items.Item
	})
}

module.exports = lookup

function find(value) {
	return function checkObject(o, path) {
		path = path || []
		if (o == value) {
			console.log('found', value, 'at', path)
			// throw new Error('FOUND')
		}
		if (o && path.length < 10) {
			Object.keys(o).forEach(function(key) {
				// console.log('checking', path.concat(key))
				checkObject(o[key], path.concat(key))
			})
		}
	}
}

// var a = lookup('9780310246077')
// a.then(find('9780310246077'))
// a.then(find('0310246075'))
// a.then(function(result) {
// 	console.log('isbn', result.Items.Item.ItemAttributes.ISBN)
// })
