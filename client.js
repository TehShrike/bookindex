var StateRouter = require('abstract-state-router')
var ractiveRenderer = require('ractive-state-router')
var domready = require('domready')

var stateRouter = StateRouter(ractiveRenderer(), 'body')

console.log(window.mainModule)

var getMediator = null
if (window.mainModule) {
	console.log('Using the mediator from the main module')
	getMediator = window.mainModule.exports.getMediator
} else {
	console.log('No main module found: creating a mediator for the browser client only')
	getMediator = require('mannish')()
}


require('./states/main/main')(stateRouter, getMediator)

domready(function() {
	stateRouter.evaluateCurrentRoute('main')
})
