var amazonFetcher = require('../isbn-amazon-fetcher')
var dataz = [ '9780310246077', '9780980576894', 'LPN4404271486', '9781885904317', '9780805425901' ]

// amazonFetcher(dataz)

dataz.forEach(function(barcode) {
	var check = find(barcode)
	amazonFetcher(barcode).then(function(result) {
		console.log('LOOKED UP', barcode, typeof result)
		check(result)
	})
})

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
