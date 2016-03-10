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
