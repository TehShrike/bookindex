var fs = require('fs')

module.exports = function(stateRouter, mediator) {
	stateRouter.addState({
		name: 'main.scan',
		template: fs.readFileSync('states/main-scan/main-scan.html', { encoding: 'utf8' }),
		activate: function(context) {

			var ractive = context.domApi


		}
	})
}
