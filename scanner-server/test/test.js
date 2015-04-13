var scannerServer = require('../scanner-server')
var fs = require('fs')
var mannish = require('mannish')

var getMediator = mannish()

var originalTestFile = '/Users/josh/code/bookindex/scanner-server/test/BARCODES-TEST.TXT'
var copyForTest = '/Users/josh/code/bookindex/scanner-server/test/BARCODES.TXT'

console.log('copying', originalTestFile, 'to', copyForTest)
fs.writeFileSync(copyForTest, fs.readFileSync(originalTestFile, { encoding: 'utf8' }))

var stop = scannerServer(getMediator)

var mediator = getMediator('test app')

mediator.subscribe('books scanned', function(books) {
	console.log(books.length + ' books published to the mediator:', books.map(function(books) {
		return book.title + ' by ' + book.author
	}))
})

setTimeout(function() {
	stop()
}, 5000)
