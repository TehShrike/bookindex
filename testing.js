var aws = require('aws-lib')
var split = require('split')
var fs = require('fs')

var productAdvertisingApi = aws.createProdAdvClient(accessKey, secretAccessKey, associateTag)

function details(isbn) {
	productAdvertisingApi.call('ItemLookup', {
		ResponseGroup: 'Large',
		SearchIndex: 'Books',
		IdType: 'ISBN',
		ItemId: isbn
	}, function(err, result) {
		if (err) {
			console.error('error', err)
		} else {
			console.log(result.Items.Item.ItemAttributes || result.Items.Item)
		}
	})
}

function dealWithFile(file) {
	fs.createReadStream(file).pipe(split()).on('data', function(line) {
		console.log(line)
	}).on('error', function(err) {
		console.log('whatever', err)
	})
}

var file = '/Volumes/CS3000/Scanned Barcodes/BARCODES.TXT'
dumbWatch(file, function(stream) {
	stream.pipe(split()).on('data', function(line) {
		if (line) {
			var columns = line.split(',')
			var isbn = columns[columns.length - 1]
			details(isbn)
		}
	})
})

function dumbWatch(path, cb) {
	var reading = false
	setInterval(function() {
		if (!reading) {
			fs.stat(path, function(err, stats) {
				if (!err && stats.isFile()) {
					reading = true
					var stream = fs.createReadStream(path)
					cb(stream)
					stream.on('end', function() {
						// reading = false
						fs.unlink(path, function() {
							reading = false
						})
					})
				}
			})
		}
	}, 1000)
}