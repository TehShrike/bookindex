var amazonFetcher = require('./isbn-amazon-fetcher')
var barcodeScannerWatcher = require('./barcode-scanner-watcher')
var isbnModel = require('barcode-model')

module.exports = function(getMediator) {
	var mediator = getMediator('scanner server')
	var scannerWatcher = barcodeScannerWatcher()

	function startAmazonBatch() {
		return startBatch(1, amazonFetcher, function emitBooks(promise) {
			return promise.then(function(result) {
				var dbBook = amazonResultToDatabaseRecord(result.book)

				var insertPromise = isbnModel.insert(dbBook)

				insertPromise.then(function(books) {
					mediator.publish('books scanned', books)
				})

				return insertPromise
			})
		})
	}

	function startDatabaseBatch(cb) {
		return startBatch(20, isbnModel.findIsbnsInDatabase, function(promise) {
			return promise.then(function(results) {
				if (results.found.length > 0) {
					mediator.publish('books scanned', results.found)
				}
				try {
					return cb(results.notFound)
				} catch (e) {
					console.error(e)
				}
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
					// throw err
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
		author: getSomeAuthorString(amazonApiResult),
		upc: amazonApiResult.ItemAttributes.UPC,
		isbn: amazonApiResult.ItemAttributes.ISBN || amazonApiResult.ItemAttributes.EISBN,
		ean: amazonApiResult.ItemAttributes.EAN,
		asin: amazonApiResult.ASIN,
		amazonResult: JSON.stringify(amazonApiResult)
	}
}

function getSomeAuthorString(item) {
	var author = item.ItemAttributes.Author
	var creator = item.ItemAttributes.Creator

	if (Array.isArray(author)) {
		return author.join('\n')
	} else if (author) {
		return author
	} else if (creator) {
		return creator.map(function(creator) {
			return creator['#']
		}).join('\n')
	}

	return 'unknown?!?!'
}
