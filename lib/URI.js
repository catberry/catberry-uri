/*
 * catberry
 *
 * Copyright (c) 2014 Denis Rechkunov and project contributors.
 *
 * catberry's license follows:
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
 * This license applies to all parts of catberry that are not externally
 * maintained libraries.
 */

'use strict';

module.exports = URI;

var Authority = require('./Authority'),
	percentEncodingHelper = require('./percentEncodingHelper'),
	Query = require('./Query');

	// https://tools.ietf.org/html/rfc3986#appendix-B
var URI_PARSE_REGEXP = new RegExp(
		'^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?'
	),
	// https://tools.ietf.org/html/rfc3986#section-3.1
	SCHEME_REGEXP = /^[a-z]+[a-z\d\+\.-]*$/i,
	ERROR_SCHEME = 'URI scheme must satisfy expression ' +
		SCHEME_REGEXP.toString(),
	ERROR_BASE_SCHEME = 'Scheme component is required to be present ' +
		'in a base URI';

/**
 * Creates new instance of URI according to RFC 3986.
 * @param {String?} uriString URI string to parse components.
 * @constructor
 */
function URI(uriString) {
	if (typeof(uriString) !== 'string') {
		uriString = '';
	}

	// https://tools.ietf.org/html/rfc3986#appendix-B
	var matches = uriString.match(URI_PARSE_REGEXP);

	if (matches) {
		if (typeof(matches[2]) === 'string') {
			this.scheme = percentEncodingHelper.decode(matches[2]);
		}
		if (typeof(matches[4]) === 'string') {
			this.authority = new Authority(matches[4]);
		}
		if (typeof(matches[5]) === 'string') {
			this.path = percentEncodingHelper.decode(matches[5]);
		}
		if (typeof(matches[7]) === 'string') {
			this.query = new Query(matches[7]);
		}
		if (typeof(matches[9]) === 'string') {
			this.fragment = percentEncodingHelper.decode(matches[9]);
		}
	}
}

/**
 * Current URI scheme.
 * https://tools.ietf.org/html/rfc3986#section-3.1
 * @type {String}
 */
URI.prototype.scheme = null;

/**
 * Current URI authority.
 * https://tools.ietf.org/html/rfc3986#section-3.2
 * @type {Authority}
 */
URI.prototype.authority = null;

/**
 * Current URI path.
 * https://tools.ietf.org/html/rfc3986#section-3.3
 * @type {String}
 */
URI.prototype.path = null;

/**
 * Current URI query.
 * https://tools.ietf.org/html/rfc3986#section-3.4
 * @type {Query}
 */
URI.prototype.query = null;

/**
 * Current URI fragment.
 * https://tools.ietf.org/html/rfc3986#section-3.5
 * @type {String}
 */
URI.prototype.fragment = null;

/**
 * Converts a URI reference that might be relative to a given base URI
 * into the reference's target URI.
 * https://tools.ietf.org/html/rfc3986#section-5.2
 * @param {URI} baseUri Base URI.
 * @returns {URI} Resolved URI.
 */
URI.prototype.resolveRelative = function (baseUri) {
	if (!baseUri.scheme) {
		throw new Error(ERROR_BASE_SCHEME);
	}

	return transformReference(baseUri, this);
};

/**
 * Clones current URI to a new object.
 * @returns {URI} New clone of current object.
 */
URI.prototype.clone = function () {
	var uri = new URI();

	if (typeof(this.scheme) === 'string') {
		uri.scheme = this.scheme;
	}

	if (this.authority) {
		uri.authority = this.authority.clone();
	}

	if (typeof(this.path) === 'string') {
		uri.path = this.path;
	}

	if (this.query) {
		uri.query = this.query.clone();
	}

	if (typeof(this.fragment) === 'string') {
		uri.fragment = this.fragment;
	}

	return uri;
};

/**
 * Recomposes URI components to URI string,
 * https://tools.ietf.org/html/rfc3986#section-5.3
 * @returns {string} URI string.
 */
URI.prototype.toString = function () {
	var result = '';

	if (this.scheme !== undefined && this.scheme !== null) {
		var scheme = String(this.scheme);
		if (!SCHEME_REGEXP.test(scheme)) {
			throw new Error(ERROR_SCHEME);
		}
		result += scheme + ':';
	}

	if (this.authority) {
		result += '//' + this.authority.toString();
	}

	var path = this.path === undefined || this.path === null ?
		'' : String(this.path);
	result += percentEncodingHelper.encodePath(path);

	if (this.query) {
		result += '?' + this.query.toString();
	}

	if (this.fragment !== undefined && this.fragment !== null) {
		var fragment = String(this.fragment);
		result += '#' + percentEncodingHelper.encodeFragment(fragment);
	}

	return result;
};

/**
 * Transforms reference for relative resolution.
 * Whole algorithm has been taken from
 * https://tools.ietf.org/html/rfc3986#section-5.2.2
 * @param {URI} baseUri Base URI for resolution.
 * @param {URI} referenceUri Reference URI to resolve.
 * @returns {URI} Components of target URI.
 */
/*jshint maxdepth:false */
/*jshint maxcomplexity:false */
function transformReference(baseUri, referenceUri) {
	var targetUri = new URI('');

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
					targetUri.path =
						removeDotSegments(referenceUri.path);
				} else {
					targetUri.path =
						merge(baseUri, referenceUri);
					targetUri.path =
						removeDotSegments(targetUri.path);
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
 * @returns {String} Merged path.
 */
function merge(baseUri, referenceUri) {
	if (baseUri.authority && baseUri.path === '') {
		return '/' + referenceUri.path;
	}

	var segmentsString = baseUri.path.indexOf('/') !== -1 ?
		baseUri.path.replace(/\/[^\/]+$/, '/') : '';

	return segmentsString + referenceUri.path;
}

/**
 * Removes dots segments from URI path.
 * https://tools.ietf.org/html/rfc3986#section-5.2.4
 * @param {String} uriPath URI path with possible dot segments.
 * @returns {String} URI path without dot segments.
 */
function removeDotSegments(uriPath) {
	if (!uriPath) {
		return '';
	}

	var inputBuffer = uriPath,
		newBuffer = '',
		nextSegment = '',
		outputBuffer = '';

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