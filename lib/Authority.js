'use strict';

const UserInfo = require('./UserInfo');
const percentEncodingHelper = require('./percentEncodingHelper');

const PORT_REGEXP = /^\d+$/;
const ERROR_PORT = `URI authority port must satisfy expression ${PORT_REGEXP.toString()}`;

/**
 * Current user information.
 * https://tools.ietf.org/html/rfc3986#section-3.2.1
 * @type {UserInfo}
 *
 * Current host.
 * https://tools.ietf.org/html/rfc3986#section-3.2.2
 * @type {string}
 *
 * Current port.
 * https://tools.ietf.org/html/rfc3986#section-3.2.3
 * @type {string}
 */
class Authority {

	/**
	 * Creates new instance of URI authority component parser.
	 * https://tools.ietf.org/html/rfc3986#section-3.2
	 * @param {string?} authorityString URI authority component string.
	 */
	constructor(authorityString) {

		/**
		 * Current user information.
		 * https://tools.ietf.org/html/rfc3986#section-3.2.1
		 * @type {UserInfo}
		 */
		this.userInfo = null;

		/**
		 * Current port.
		 * https://tools.ietf.org/html/rfc3986#section-3.2.3
		 * @type {string}
		 */
		this.port = null;

		/**
		 * Current host.
		 * https://tools.ietf.org/html/rfc3986#section-3.2.2
		 * @type {string}
		 */
		this.host = null;

		if (typeof (authorityString) === 'string' && authorityString.length > 0) {
			const firstAtIndex = authorityString.indexOf('@');
			if (firstAtIndex !== -1) {
				const userInfoString = authorityString.substring(0, firstAtIndex);
				this.userInfo = new UserInfo(userInfoString);
				authorityString = authorityString.substring(firstAtIndex + 1);
			}

			const lastColonIndex = authorityString.lastIndexOf(':');
			if (lastColonIndex !== -1) {
				const portString = authorityString.substring(lastColonIndex + 1);
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
	 * Clones current authority.
	 * @returns {Authority} New clone of current object.
	 */
	clone() {
		const authority = new Authority();
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
	}

	/**
	 * Recombine all authority components into authority string.
	 * @returns {string} Authority component string.
	 */
	toString() {
		let result = '';
		if (this.userInfo) {
			result += `${this.userInfo.toString()}@`;
		}
		if (this.host !== undefined && this.host !== null) {
			const host = String(this.host);
			result += percentEncodingHelper.encodeHost(host);
		}
		if (this.port !== undefined && this.port !== null) {
			const port = String(this.port);
			if (port.length > 0 && !PORT_REGEXP.test(port)) {
				throw new Error(ERROR_PORT);
			}
			result += `:${port}`;
		}
		return result;
	}
}

module.exports = Authority;
