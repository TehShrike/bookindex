var mannish = require('mannish')

exports.getMediator = mannish('server')

var mediator = exports.getMediator()

console.log('adding scanner subscriber')
mediator.subscribe('scanner:isLoaded', function(ignore, cb) {
	console.log('received "isLoaded" request.  Responding!')
	cb(null, true)
})
