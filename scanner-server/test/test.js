var scannerServer = require('../scanner-server')
var fs = require('fs')

var originalTestFile = '/Users/josh/code/bookindex/scanner-server/test/BARCODES-TEST.TXT'
var copyForTest = '/Users/josh/code/bookindex/scanner-server/test/BARCODES.TXT'

console.log('copying', originalTestFile, 'to', copyForTest)
fs.writeFileSync(copyForTest, fs.readFileSync(originalTestFile, { encoding: 'utf8' }))

var stop = scannerServer()

setTimeout(function() {
	stop()
}, 10000)
