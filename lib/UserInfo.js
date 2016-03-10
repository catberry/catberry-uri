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

const percentEncodingHelper = require('./percentEncodingHelper');

class UserInfo {

	/**
	 * Creates new instance of user information component parser.
	 * https://tools.ietf.org/html/rfc3986#section-3.2.1
	 * @param {string?} userInfoString User information component string.
	 */
	constructor(userInfoString) {

		/**
		 * Current user component.
		 * @type {string}
		 */
		this.user = null;

		/**
		 * Current password.
		 * @type {string}
		 */
		this.password = null;

		if (typeof (userInfoString) === 'string' && userInfoString.length > 0) {
			const parts = userInfoString.split(':');
			if (typeof (parts[0]) === 'string') {
				this.user = percentEncodingHelper.decode(parts[0]);
			}
			if (typeof (parts[1]) === 'string') {
				this.password = percentEncodingHelper.decode(parts[1]);
			}
		}
	}

	/**
	 * Clones current user information.
	 * @returns {UserInfo} New clone of current object.
	 */
	clone() {
		const userInfo = new UserInfo();
		if (typeof (this.user) === 'string') {
			userInfo.user = this.user;
		}
		if (typeof (this.password) === 'string') {
			userInfo.password = this.password;
		}
		return userInfo;
	}

	/**
	 * Recombines user information components to userInfo string.
	 * @returns {string} User information component string.
	 */
	toString() {
		let result = '';
		if (this.user !== undefined && this.user !== null) {
			const user = String(this.user);
			result += percentEncodingHelper
				.encodeUserInfoSubComponent(user);
		}
		if (this.password !== undefined && this.password !== null) {
			const password = String(this.password);
			result += `:${percentEncodingHelper.encodeUserInfoSubComponent(password)}`;
		}

		return result;
	}
}

module.exports = UserInfo;
