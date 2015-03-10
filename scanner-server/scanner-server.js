var amazonFetcher = require('./isbn-amazon-fetcher')
var barcodeScannerWatcher = require('./barcode-scanner-watcher')

module.exports = function() {
	var scannerWatcher = barcodeScannerWatcher()

	scannerWatcher.on('file', function(stream) {
		stream.on('data', function(isbn) {
			isbn = isbn.toString()
			amazonFetcher(isbn).then(function(book) {
				console.log(book)
			})
		})
	})

	return function stop() {
		scannerWatcher.stop()
	}
}
