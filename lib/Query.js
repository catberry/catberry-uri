/*
 * catberry-uri
 *
 * Copyright (c) 2014 Denis Rechkunov and project contributors.
 *
 * catberry-uri's license follows:
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This license applies to all parts of catberry-uri that are not externally
 * maintained libraries.
 */

'use strict';

module.exports = Query;

var percentEncodingHelper = require('./percentEncodingHelper');

/**
 * Creates new instance of URI query component parser.
 * https://tools.ietf.org/html/rfc3986#section-3.4
 * @param {String?} queryString URI query component string.
 * @constructor
 */
function Query(queryString) {
	if (typeof(queryString) === 'string') {
		this.values = {};

		queryString
			.split('&')
			.forEach(function (pair) {
				var parts = pair.split('='),
					key = percentEncodingHelper.decode(parts[0]);
				if (!key) {
					return;
				}
				this.values[key] = typeof(parts[1]) === 'string' ?
					percentEncodingHelper.decode(parts[1]) : null;
			}, this);
	}
}

/**
 * Current set of values of query.
 * @type {Object}
 */
Query.prototype.values = null;

/**
 * Clones current query to a new object.
 * @returns {Query} New clone of current object.
 */
Query.prototype.clone = function () {
	var query = new Query();
	if (this.values) {
		query.values = {};
		Object.keys(this.values)
			.forEach(function (key) {
				query.values[key] = this.values[key];
			}, this);
	}
	return query;
};

/**
 * Converts current set of query values to string.
 * @returns {string} Query component string.
 */
Query.prototype.toString = function () {
	if (!this.values) {
		return '';
	}

	return Object.keys(this.values)
			.map(function (key) {
				var result = percentEncodingHelper
					.encodeQuerySubComponent(key);
				if (typeof(this.values[key]) === 'string') {
					result += '=' + percentEncodingHelper
						.encodeQuerySubComponent(this.values[key]);
				}
				return result;
			}, this)
			.join('&');
};