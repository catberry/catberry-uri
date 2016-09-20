'use strict';

// https://tools.ietf.org/html/rfc3986#section-2.1

module.exports = {
	// \uD800-\uDBFF \uDC00-\uDFFF
	// surrogates pairs like emoji we should ignore
	/**
	 * Encodes authority user information sub-component according to RFC 3986.
	 * @param {string} string Component to encode.
	 * @returns {string} Encoded component.
	 */
	encodeUserInfoSubComponent(string) {
		return string.replace(
			// https://tools.ietf.org/html/rfc3986#section-3.2.1
			/[^\w\.~\-!\$&'\(\)\*\+,;=\uD800-\uDBFF\uDC00-\uDFFF]/g,
			encodeURIComponent
		);
	},

	/**
	 * Encodes authority host component according to RFC 3986.
	 * @param {string} string Component to encode.
	 * @returns {string} Encoded component.
	 */
	encodeHost(string) {
		return string.replace(
			// https://tools.ietf.org/html/rfc3986#section-3.2.2
			/[^\w\.~\-!\$&'\(\)\*\+,;=:\[\]\uD800-\uDBFF\uDC00-\uDFFF]/g,
			encodeURIComponent
		);
	},

	/**
	 * Encodes URI path component according to RFC 3986.
	 * @param {string} string Component to encode.
	 * @returns {string} Encoded component.
	 */
	encodePath(string) {
		return string.split(/%2f/i)
			.map(part => {
				return part.replace(
					// https://tools.ietf.org/html/rfc3986#section-3.3
					/[^\w\.~\-!\$&'\(\)\*\+,;=:@\/\uD800-\uDBFF\uDC00-\uDFFF]/g,
					encodeURIComponent
				);
			})
			.reduce((prev, current) => {
				if (!prev) {
					return current;
				}
				if (!current) {
					return prev;
				}
				return `${prev}%2F${current}`;
			}, '');
	},

	/**
	 * Encodes query sub-component according to RFC 3986.
	 * @param {string} string Component to encode.
	 * @returns {string} Encoded component.
	 */
	encodeQuerySubComponent(string) {
		return string.replace(
			// https://tools.ietf.org/html/rfc3986#section-3.4
			/[^\w\.~\-!\$'\(\)\*,;:@\/\?\uD800-\uDBFF\uDC00-\uDFFF]/g,
			encodeURIComponent
		);
	},

	/**
	 * Encodes URI fragment component according to RFC 3986.
	 * @param {string} string Component to encode.
	 * @returns {string} Encoded component.
	 */
	encodeFragment(string) {
		return string.replace(
			// https://tools.ietf.org/html/rfc3986#section-3.5
			/[^\w\.~\-!\$&'\(\)\*\+,;=:@\/\?\uD800-\uDBFF\uDC00-\uDFFF]/g,
			encodeURIComponent
		);
	},

	/**
	 * Decodes percent encoded component.
	 * @param {string} string Component to decode.
	 * @returns {string} Decoded component.
	 */
	decode(string) {
		return decodeURIComponent(string);
	},

	/**
	 * Decodes percent encoded path component.
	 * @param {string} string Component to decode.
	 * @returns {string} Decoded path component.
	 */
	decodePath(string) {
		return string.split(/%2f/i)
			.map(decodeURIComponent)
			.reduce((prev, current) => {
				if (!prev) {
					return current;
				}
				if (!current) {
					return prev;
				}
				return `${prev}%2F${current}`;
			}, '');
	}
};
