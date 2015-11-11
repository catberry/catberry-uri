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

module.exports = Authority;

var UserInfo = require('./UserInfo'),
	percentEncodingHelper = require('./percentEncodingHelper');

var PORT_REGEXP = /^\d+$/,
	ERROR_PORT = 'URI authority port must satisfy expression ' +
		PORT_REGEXP.toString();

/**
 * Creates new instance of URI authority component parser.
 * https://tools.ietf.org/html/rfc3986#section-3.2
 * @param {string?} authorityString URI authority component string.
 * @constructor
 */
function Authority(authorityString) {
	if (typeof (authorityString) === 'string' && authorityString.length > 0) {
		var firstAtIndex = authorityString.indexOf('@');
		if (firstAtIndex !== -1) {
			var userInfoString = authorityString.substring(0, firstAtIndex);
			this.userInfo = new UserInfo(userInfoString);
			authorityString = authorityString.substring(firstAtIndex + 1);
		}

		var lastColonIndex = authorityString.lastIndexOf(':');
		if (lastColonIndex !== -1) {
			var portString = authorityString.substring(lastColonIndex + 1);
			if (lastColonIndex === authorityString.length - 1) {
				this.port = '';
				authorityString = authorityString.substring(0, lastColonIndex);
			} else if (PORT_REGEXP.test(portString)) {
				this.port = portString;
				authorityString = authorityString.substring(0, lastColonIndex);
			}
		}

		this.host = percentEncodingHelper.decode(authorityString);
	}
}

/**
 * Current user information.
 * https://tools.ietf.org/html/rfc3986#section-3.2.1
 * @type {UserInfo}
 */
Authority.prototype.userInfo = null;

/**
 * Current host.
 * https://tools.ietf.org/html/rfc3986#section-3.2.2
 * @type {string}
 */
Authority.prototype.host = null;

/**
 * Current port.
 * https://tools.ietf.org/html/rfc3986#section-3.2.3
 * @type {string}
 */
Authority.prototype.port = null;

/**
 * Clones current authority.
 * @returns {Authority} New clone of current object.
 */
Authority.prototype.clone = function () {
	var authority = new Authority();
	if (this.userInfo) {
		authority.userInfo = this.userInfo.clone();
	}
	if (typeof (this.host) === 'string') {
		authority.host = this.host;
	}
	if (typeof (this.port) === 'string') {
		authority.port = this.port;
	}
	return authority;
};

/**
 * Recombine all authority components into authority string.
 * @returns {string} Authority component string.
 */
Authority.prototype.toString = function () {
	var result = '';
	if (this.userInfo) {
		result += this.userInfo.toString() + '@';
	}
	if (this.host !== undefined && this.host !== null) {
		var host = String(this.host);
		result += percentEncodingHelper.encodeHost(host);
	}
	if (this.port !== undefined && this.port !== null) {
		var port = String(this.port);
		if (port.length > 0 && !PORT_REGEXP.test(port)) {
			throw new Error(ERROR_PORT);
		}
		result += ':' + port;
	}
	return result;
};