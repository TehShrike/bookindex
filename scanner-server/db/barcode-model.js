var Joi = require('joi')
var Promise = require('promise')
var getPool = require('db')
var q = require('sql-concat')
var snakeize = require('snakeize')
var camelize = require('camelize')

  // `upc` CHAR(12) DEFAULT NULL,
  // `isbn` CHAR(13) DEFAULT NULL,
  // `ean` CHAR(13) DEFAULT NULL,
  // `asin` CHAR(10) DEFAULT NULL,

var schema = Joi.object({
	id: Joi.number().integer().max(4294967295).min(0),
	upc: Joi.string().max(12),
	isbn: Joi.string().max(13),
	ean: Joi.string().max(13),
	asin: Joi.string().max(10),
	title: Joi.string().max(500),
	author: Joi.string().max(500),
	amazon_result: Joi.string().max(65535),
	last_amazon_update: Joi.date().default(function() { return new Date() }, 'current time')
}).or('upc', 'isbn', 'ean', 'asin')


var validateDbBook = Promise.denodeify(function validate(o, cb) {
	schema.validate(o, cb)
})

function insert(books) {
	if (!Array.isArray(books)) {
		return insert([ books ])
	}
	return Promise.all(books.map(snakeize).map(function(book) {
		return validateDbBook(book)
	})).then(function(books) {
		return Promise.all(books.map(function(book) {
			return getPool().query('INSERT IGNORE INTO barcode SET ?', book).then(function(result) {
				if (result.insertId) {
					book.bookId = result.insertId
					return book
				} else {
					return null
				}
			})
		})).then(function(insertResults) {
			return insertResults.filter(function(book) {
				return book !== null
			})
		})
	})
}

function loadByBarcode(barcodeAry) {
	var query = q.select('id, upc, isbn, ean, asin, title, author, amazon_result')
		.from('barcode')
		.where('isbn', barcodeAry)
		.orWhere('upc', barcodeAry)
		.orWhere('ean', barcodeAry)
		.orWhere('asin', barcodeAry)

	return getPool().query(query.build()).then(function(results) {
		return results.map(camelize)
	})
}

function findIsbnsInDatabase(barcodeAry) {
	return loadByBarcode(barcodeAry).then(function(results) {
		return {
			found: results,
			notFound: barcodeAry.filter(function notInQueryResult(isbn) {
				return results.every(function(row) {
					return [ row.upc, row.isbn, row.ean, row.asin ].indexOf(isbn) === -1
				})
			})
		}
	})
}

module.exports = {
	loadByBarcode: loadByBarcode,
	insert: insert,
	findIsbnsInDatabase: findIsbnsInDatabase
}
