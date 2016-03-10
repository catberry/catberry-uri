'use strict';

const Authority = require('./Authority');
const percentEncodingHelper = require('./percentEncodingHelper');
const Query = require('./Query');

// https://tools.ietf.org/html/rfc3986#appendix-B
const URI_PARSE_REGEXP = new RegExp(
	'^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?'
	);
// https://tools.ietf.org/html/rfc3986#section-3.1
const SCHEME_REGEXP = /^[a-z]+[a-z\d\+\.-]*$/i;
const ERROR_SCHEME = `URI scheme must satisfy expression ${SCHEME_REGEXP.toString()}`;

class URI {

	/**
	 * Creates new instance of URI according to RFC 3986.
	 * @param {string?} uriString URI string to parse components.
	 */
	constructor(uriString) {

		/**
		 * Current URI scheme.
		 * https://tools.ietf.org/html/rfc3986#section-3.1
		 * @type {string}
		 */
		this.scheme = null;

		/**
		 * Current URI authority.
		 * https://tools.ietf.org/html/rfc3986#section-3.2
		 * @type {Authority}
		 */
		this.authority = null;

		/**
		 * Current URI path.
		 * https://tools.ietf.org/html/rfc3986#section-3.3
		 * @type {string}
		 */
		this.path = null;

		/**
		 * Current URI query.
		 * https://tools.ietf.org/html/rfc3986#section-3.4
		 * @type {Query}
		 */
		this.query = null;

		/**
		 * Current URI fragment.
		 * https://tools.ietf.org/html/rfc3986#section-3.5
		 * @type {string}
		 */
		this.fragment = null;

		if (typeof (uriString) !== 'string') {
			uriString = '';
		}

		// https://tools.ietf.org/html/rfc3986#appendix-B
		const matches = uriString.match(URI_PARSE_REGEXP);

		if (matches) {
			if (typeof (matches[2]) === 'string') {
				this.scheme = percentEncodingHelper.decode(matches[2]);
			}
			if (typeof (matches[4]) === 'string') {
				this.authority = new Authority(matches[4]);
			}
			if (typeof (matches[5]) === 'string') {
				this.path = percentEncodingHelper.decodePath(matches[5]);
			}
			if (typeof (matches[7]) === 'string') {
				this.query = new Query(matches[7]);
			}
			if (typeof (matches[9]) === 'string') {
				this.fragment = percentEncodingHelper.decode(matches[9]);
			}
		}
	}

	/**
	 * Converts a URI reference that might be relative to a given base URI
	 * into the reference's target URI.
	 * https://tools.ietf.org/html/rfc3986#section-5.2
	 * @param {URI} baseUri Base URI.
	 * @returns {URI} Resolved URI.
	 */
	resolveRelative(baseUri) {
		if (!baseUri.scheme) {
			throw new Error('Scheme component is required to be present in a base URI');
		}

		return transformReference(baseUri, this);
	}

	/**
	 * Clones current URI to a new object.
	 * @returns {URI} New clone of current object.
	 */
	clone() {
		const uri = new URI();

		if (typeof (this.scheme) === 'string') {
			uri.scheme = this.scheme;
		}

		if (this.authority) {
			uri.authority = this.authority.clone();
		}

		if (typeof (this.path) === 'string') {
			uri.path = this.path;
		}

		if (this.query) {
			uri.query = this.query.clone();
		}

		if (typeof (this.fragment) === 'string') {
			uri.fragment = this.fragment;
		}

		return uri;
	}

	/**
	 * Recomposes URI components to URI string,
	 * https://tools.ietf.org/html/rfc3986#section-5.3
	 * @returns {string} URI string.
	 */
	toString() {
		let result = '';

		if (this.scheme !== undefined && this.scheme !== null) {
			const scheme = String(this.scheme);
			if (!SCHEME_REGEXP.test(scheme)) {
				throw new Error(ERROR_SCHEME);
			}
			result += `${scheme}:`;
		}

		if (this.authority) {
			result += `//${this.authority.toString()}`;
		}

		const path = this.path === undefined || this.path === null ?
			'' : String(this.path);
		result += percentEncodingHelper.encodePath(path);

		if (this.query) {
			result += `?${this.query.toString()}`;
		}

		if (this.fragment !== undefined && this.fragment !== null) {
			const fragment = String(this.fragment);
			result += `#${percentEncodingHelper.encodeFragment(fragment)}`;
		}

		return result;
	}
}

/**
 * Transforms reference for relative resolution.
 * Whole algorithm has been taken from
 * https://tools.ietf.org/html/rfc3986#section-5.2.2
 * @param {URI} baseUri Base URI for resolution.
 * @param {URI} referenceUri Reference URI to resolve.
 * @returns {URI} Components of target URI.
 */
function transformReference(baseUri, referenceUri) {

	/* eslint complexity: [2, 13]*/
	const targetUri = new URI('');

	if (referenceUri.scheme) {
		targetUri.scheme = referenceUri.scheme;
		targetUri.authority = referenceUri.authority ?
			referenceUri.authority.clone() : referenceUri.authority;
		targetUri.path = removeDotSegments(referenceUri.path);
		targetUri.query = referenceUri.query ?
			referenceUri.query.clone() : referenceUri.query;
	} else {
		if (referenceUri.authority) {
			targetUri.authority = referenceUri.authority ?
				referenceUri.authority.clone() : referenceUri.authority;
			targetUri.path = removeDotSegments(referenceUri.path);
			targetUri.query = referenceUri.query ?
				referenceUri.query.clone() : referenceUri.query;
		} else {
			if (referenceUri.path === '') {
				targetUri.path = baseUri.path;
				if (referenceUri.query) {
					targetUri.query = referenceUri.query.clone();
				} else {
					targetUri.query = baseUri.query ?
						baseUri.query.clone() : baseUri.query;
				}
			} else {
				if (referenceUri.path[0] === '/') {
					targetUri.path = removeDotSegments(referenceUri.path);
				} else {
					targetUri.path = merge(baseUri, referenceUri);
					targetUri.path = removeDotSegments(targetUri.path);
				}
				targetUri.query = referenceUri.query ?
					referenceUri.query.clone() : referenceUri.query;
			}
			targetUri.authority = baseUri.authority ?
				baseUri.authority.clone() : baseUri.authority;
		}
		targetUri.scheme = baseUri.scheme;
	}

	targetUri.fragment = referenceUri.fragment;
	return targetUri;
}

/**
 * Merges a relative-path reference with the path of the base URI.
 * https://tools.ietf.org/html/rfc3986#section-5.2.3
 * @param {URI} baseUri Components of base URI.
 * @param {URI} referenceUri Components of reference URI.
 * @returns {string} Merged path.
 */
function merge(baseUri, referenceUri) {
	if (baseUri.authority && baseUri.path === '') {
		return `/${referenceUri.path}`;
	}

	const segmentsString = baseUri.path.indexOf('/') !== -1 ?
		baseUri.path.replace(/\/[^\/]+$/, '/') : '';

	return segmentsString + referenceUri.path;
}

/**
 * Removes dots segments from URI path.
 * https://tools.ietf.org/html/rfc3986#section-5.2.4
 * @param {string} uriPath URI path with possible dot segments.
 * @returns {string} URI path without dot segments.
 */
function removeDotSegments(uriPath) {
	if (!uriPath) {
		return '';
	}

	let inputBuffer = uriPath;
	let newBuffer = '';
	let nextSegment = '';
	let outputBuffer = '';

	while (inputBuffer.length !== 0) {

		// If the input buffer begins with a prefix of "../" or "./",
		// then remove that prefix from the input buffer
		newBuffer = inputBuffer.replace(/^\.?\.\//, '');
		if (newBuffer !== inputBuffer) {
			inputBuffer = newBuffer;
			continue;
		}

		// if the input buffer begins with a prefix of "/./" or "/.",
		// where "." is a complete path segment, then replace that
		// prefix with "/" in the input buffer
		newBuffer = inputBuffer.replace(/^((\/\.\/)|(\/\.$))/, '/');
		if (newBuffer !== inputBuffer) {
			inputBuffer = newBuffer;
			continue;
		}

		// if the input buffer begins with a prefix of "/../" or "/..",
		// where ".." is a complete path segment, then replace that
		// prefix with "/" in the input buffer and remove the last
		// segment and its preceding "/" (if any) from the output
		// buffer
		newBuffer = inputBuffer.replace(/^((\/\.\.\/)|(\/\.\.$))/, '/');
		if (newBuffer !== inputBuffer) {
			outputBuffer = outputBuffer.replace(/\/[^\/]+$/, '');
			inputBuffer = newBuffer;
			continue;
		}

		// if the input buffer consists only of "." or "..", then remove
		// that from the input buffer
		if (inputBuffer === '.' || inputBuffer === '..') {
			break;
		}

		// move the first path segment in the input buffer to the end of
		// the output buffer, including the initial "/" character (if
		// any) and any subsequent characters up to, but not including,
		// the next "/" character or the end of the input buffer
		nextSegment = /^\/?[^\/]*(\/|$)/.exec(inputBuffer)[0];
		nextSegment = nextSegment.replace(/([^\/])(\/$)/, '$1');
		inputBuffer = inputBuffer.substring(nextSegment.length);
		outputBuffer += nextSegment;
	}

	return outputBuffer;
}

module.exports = URI;
