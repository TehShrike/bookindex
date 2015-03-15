var amazonFetcher = require('./isbn-amazon-fetcher')
var barcodeScannerWatcher = require('./barcode-scanner-watcher')
var isbnModel = require('isbn-model')

module.exports = function(getMediator) {
	var mediator = getMediator('scanner server')
	var scannerWatcher = barcodeScannerWatcher()

	function startAmazonBatch() {
		return startBatch(10, amazonFetcher, function emitBooks(promise) {
			return promise.then(function(results) {
				if (results.length > 0) {
					console.log('got back from amazon:', results.length)
					mediator.publish('books scanned', results)
					return isbnModel.insert(results.map(amazonResultToDatabaseRecord))
				}
			})
		})
	}

	function startDatabaseBatch(cb) {
		return startBatch(20, isbnModel.findIsbnsInDatabase, function(promise) {
			return promise.then(function(results) {
				console.log('got back from the database:', results.found.length)
				if (results.found.length > 0) {
					mediator.publish('books scanned', results.found)
				}
				return cb(results.notFound)
			})
		})
	}

	scannerWatcher.on('file', function(stream) {
		var doneReading = false
		var batchAmazonLookup = startAmazonBatch()
		var batchDatabaseLookup = startDatabaseBatch(function(newIsbns) {
			if (newIsbns.length > 0) {
				newIsbns.forEach(batchAmazonLookup.add)
				if (doneReading) {
					batchAmazonLookup.flush()
				}
			}
		})

		stream.on('data', function(isbn) {
			isbn = isbn.toString()
			batchDatabaseLookup.add(isbn)
		})

		stream.on('end', function() {
			doneReading = true
			batchDatabaseLookup.flush()
			batchAmazonLookup.flush()
		})
	})

	return function stop() {
		scannerWatcher.stop()
	}
}

function startBatch(limit, batchAction, promiseCallback) {
	var queue = []

	function add(isbn) {
		queue.push(isbn)
		if (queue.length >= limit) {
			flush()
		}
	}

	function flush() {
		if (queue.length > 0) {
			try {
				promiseCallback(batchAction(queue)).catch(function(err) {
					console.error(err, err.stack)
					throw err
				})
			} catch (e) {
				console.error(e, e.stack)
			}
			queue = []
		}
	}

	return {
		add: add,
		flush: flush
	}
}

function amazonResultToDatabaseRecord(amazonApiResult) {
	return {
		title: amazonApiResult.ItemAttributes.Title,
		author: typeof amazonApiResult.ItemAttributes.Author === 'string' ? amazonApiResult.ItemAttributes.Author : 'unknown!',
		isbn: amazonApiResult.ItemAttributes.ISBN || Math.random().toString(),
		amazon_result: JSON.stringify(amazonApiResult)
	}
}