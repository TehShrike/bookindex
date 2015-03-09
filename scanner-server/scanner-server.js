var amazonFetcher = require('./isbn-amazon-fetcher')
var barcodeScannerWatcher = require('./barcode-scanner-watcher')

module.exports = functino(getMediator) {
	amazonFetcher(getMediator)
	barcodeScannerWatcher(getMediator)

	var mediator = getMediator('scannerServer')

	mediator.subscribe('')
}
