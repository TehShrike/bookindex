var split = require('split')
var fs = require('fs')
var EventEmitter = require('events')
var through2 = require('through2')

// var file = '/Volumes/CS3000/Scanned Barcodes/BARCODES.TXT'
var file = '/Users/josh/code/bookindex/scanner-server/test/BARCODES.TXT'

module.exports = function start() {
	var emitter = new EventEmitter()

	emitter.stop = dumbWatch(file, function(stream) {
		var outStream = stream.pipe(split()).pipe(streamCsvToIsbn)

		emitter.emit('file', outStream)
	})

	return emitter
}

function dumbWatch(path, cb) {
	var reading = false
	var timeout = setInterval(function() {
		if (!reading) {
			fs.stat(path, function(err, stats) {
				if (!err && stats.isFile()) {
					reading = true
					var stream = fs.createReadStream(path, { encoding: 'utf8' })
					cb(stream)
					stream.on('end', function() {
						fs.unlink(path, function() {
							reading = false
						})
					})
				}
			})
		}
	}, 1000)

	return function stop() {
		clearTimeout(timeout)
	}
}

var streamCsvToIsbn = through2(function(line, enc, callback) {
	if (enc === 'buffer') {
		line = line.toString()
	}
	if (line) {
		var columns = line.split(',')
		var isbn = columns[columns.length - 1]

		this.push(isbn)

		callback()
	}
})