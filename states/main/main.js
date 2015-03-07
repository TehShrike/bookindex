var fs = require('fs')

module.exports = function(stateRouter, makeMediator) {
	var scannerLoaded = false

	stateRouter.addState({
		name: 'main',
		template: fs.readFileSync('states/main/main.html', { encoding: 'utf8' }),
		activate: function(context) {
			var mediator = makeMediator('main')
			var ractive = context.domApi

			var screens = [{
				name: 'Search',
				state: 'main.search'
			}]

			console.log('asking')
			mediator.publish('scanner:isLoaded', 'please', function(err, loaded) {
				console.log('got an answer back', err, loaded)
				if (loaded) {
					screens.push({
						name: 'Scan',
						state: 'main.scan'
					})
					ractive.set('screens', screens)
				}
			})

			ractive.set('screens', screens)

			context.on('destroy', function() {
				mediator.removeAllListeners()
			})
		}
	})
}
