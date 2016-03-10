'use strict';

const percentEncodingHelper = require('./percentEncodingHelper');

class Query {

	/**
	 * Creates new instance of URI query component parser.
	 * https://tools.ietf.org/html/rfc3986#section-3.4
	 * @param {string?} queryString URI query component string.
	 */
	constructor(queryString) {

		/**
		 * Current set of values of query.
		 * @type {Object}
		 */
		this.values = null;

		if (typeof (queryString) === 'string') {
			this.values = {};

			queryString
				.split('&')
				.forEach(pair => {
					const parts = pair.split('=');
					const key = percentEncodingHelper.decode(parts[0]);
					if (!key) {
						return;
					}
					if (key in this.values &&
						!(this.values[key] instanceof Array)) {
						this.values[key] = [this.values[key]];
					}

					const value = typeof (parts[1]) === 'string' ?
						percentEncodingHelper.decode(parts[1]) : null;

					if (this.values[key] instanceof Array) {
						this.values[key].push(value);
					} else {
						this.values[key] = value;
					}
				}, this);
		}
	}

	/**
	 * Clones current query to a new object.
	 * @returns {Query} New clone of current object.
	 */
	clone() {
		const query = new Query();
		if (this.values) {
			query.values = {};
			Object.keys(this.values)
				.forEach(key => {
					query.values[key] = this.values[key];
				}, this);
		}
		return query;
	}

	/**
	 * Converts current set of query values to string.
	 * @returns {string} Query component string.
	 */
	toString() {
		if (!this.values) {
			return '';
		}

		let queryString = '';
		Object.keys(this.values)
			.forEach(key => {
				const values = this.values[key] instanceof Array ?
					this.values[key] : [this.values[key]];

				values.forEach(value => {
					queryString += `&${percentEncodingHelper
	.encodeQuerySubComponent(key)}`;
					if (value === undefined || value === null) {
						return;
					}
					value = String(value);
					queryString += `=${percentEncodingHelper.encodeQuerySubComponent(value)}`;
				});
			}, this);

		return queryString.replace(/^&/, '');
	}
}

module.exports = Query;
