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

var assert = require('assert'),
	recombineNormal = require('./recombine-normal.json'),
	parseNonEncoded = require('./parse-non-encoded.json'),
	parseEncoded = require('./parse-encoded.json'),
	rfcNormal = require('./rfc3986-specs-normal.json'),
	rfcAbnormal = require('./rfc3986-specs-abnormal.json'),
	URI = require('../../lib/URI'),
	Authority = require('../../lib/Authority'),
	Query = require('../../lib/Query'),
	UserInfo = require('../../lib/UserInfo');

var scheme = 'scheme-+.scheme1234567890',
	user = 'user-пользователь-._~-!$&\'()*+-:/?#[]@,;=',
	path = '/some/путь/._~-!$&\'()*+/?#[]@,;=/',
	password = 'password-пароль-._~-!$&\'()*+-:/?#[]@,;=',
	host = 'host-хост-._~-!$&\'()*+-:/?#[]@,;=',
	port = '3000',
	query = '';

describe('lib/URI', function () {
	describe('constructor', function () {
		it('should create proper URI object with empty value', function () {
			var uri = new URI();
			assert.strictEqual(uri.scheme, null);
			assert.strictEqual(uri.authority, null);
			assert.strictEqual(uri.path, '');
			assert.strictEqual(uri.query, null);
			assert.strictEqual(uri.fragment, null);
		});
		describe('Parsing URI without encodings', function () {
			parseNonEncoded.items.forEach(function (item) {
				it('should properly parse ' + item.name, function () {
					var uri = new URI(item.uri),
						expected = item.expected;
					compareURI(uri, expected);
				});
			});
		});

		describe('Parsing URI with percent encoding and punycode', function () {
			parseEncoded.items.forEach(function (item) {
				it('should properly parse ' + item.name, function () {
					var uri = new URI(item.uri),
						expected = item.expected;
					compareURI(uri, expected);
				});
			});
		});
	});
	describe('#toString', function () {
		it('should recombine URI object with empty value to empty string',
			function () {
				var uri = new URI();
				assert.strictEqual(uri.toString(), '');
			});
		describe('Recombine to the non-encoded string', function () {
			parseNonEncoded.items.forEach(function (item) {
				it('should properly recombine ' + item.name, function () {
					var uri = new URI();
					fillWithObject(uri, item.expected);
					assert.strictEqual(uri.toString(), item.uri);
				});
			});
		});
		describe('Recombine to the encoded string', function () {
			parseEncoded.items.forEach(function (item) {
				it('should properly recombine ' + item.name, function () {
					var uri = new URI();
					fillWithObject(uri, item.expected);
					assert.strictEqual(uri.toString(), item.uri);
				});
			});
		});
		describe('Parse and recombine to the same string', function () {
			recombineNormal.items.forEach(function (item) {
				it('URI String = "' + item + '"', function () {
					var uri = new URI(item);
					assert.strictEqual(uri.toString(), item);
				});
			});
		});

		it('should throw error when scheme is a bad value', function () {
			var uri = new URI();
			uri.scheme = '!@#';
			assert.throws(function () {
				console.log(uri.toString());
			});
		});
		it('should throw error when port is a bad value', function () {
			var uri = new URI('http://example.org:3000');

			uri.authority.port = '!@#';
			assert.throws(function () {
				console.log(uri.toString());
			});
		});
	});
	describe('#resolveRelative', function () {
		describe('RFC 3986 5.4.1', function () {
			var baseUri = new URI(rfcNormal.baseUri);
			rfcNormal.tests.forEach(function (item) {
				var title = rfcNormal.baseUri + '->' +
					item.test + ' = ' + item.expected;
				it(title, function () {
					var referenceUri = new URI(item.test),
						resolvedUri = referenceUri.resolveRelative(baseUri);
					assert.strictEqual(resolvedUri.toString(), item.expected);
				});
			});
		});
		describe('RFC 3986 5.4.2', function () {
			var baseUri = new URI(rfcAbnormal.baseUri);
			rfcAbnormal.tests.forEach(function (item) {
				var title = rfcAbnormal.baseUri + '->' +
					item.test + ' = ' + item.expected;
				it(title, function () {
					var referenceUri = new URI(item.test),
						resolvedUri = referenceUri.resolveRelative(baseUri);
					assert.strictEqual(resolvedUri.toString(), item.expected);
				});
			});
		});
		it('should throw error if base URI has no scheme', function () {
			var uri = new URI('/example/some/../path'),
				baseUri = new URI('//example.org:3000');

			assert.throws(function () {
				console.log(uri.resolveRelative(baseUri));
			});
		});
	});
});

function compareURI(uri, expected) {
	assert.strictEqual(uri.scheme, expected.scheme);
	if (expected.authority === null) {
		assert.strictEqual(uri.authority, null);
	}else{
		assert.strictEqual(
			uri.authority.host, expected.authority.host
		);
		assert.strictEqual(
			uri.authority.port, expected.authority.port
		);
		if (expected.authority.userInfo === null) {
			assert.strictEqual(uri.authority.userInfo, null);
		}else {
			assert.strictEqual(
				uri.authority.userInfo.user,
				expected.authority.userInfo.user
			);
			assert.strictEqual(
				uri.authority.userInfo.password,
				expected.authority.userInfo.password
			);
		}
	}

	assert.strictEqual(
		uri.path, expected.path
	);

	if (expected.query === null) {
		assert.strictEqual(uri.query, null);
	}else {
		assert.strictEqual(
			Object.keys(uri.query.values).length,
			Object.keys(expected.query).length
		);
		Object.keys(expected.query)
			.forEach(function (key) {
				assert.strictEqual(
					uri.query.values[key],
					expected.query[key]
				);
			});
	}
	assert.strictEqual(uri.fragment, expected.fragment);
}

function fillWithObject(uri, object) {
	uri.scheme = object.scheme;
	if (object.authority !== null) {
		uri.authority = new Authority();
		uri.authority.host = object.authority.host;
		uri.authority.port = object.authority.port;
		if (object.authority.userInfo !== null) {
			uri.authority.userInfo = new UserInfo();
			uri.authority.userInfo.user = object.authority.userInfo.user;
			uri.authority.userInfo.password =
				object.authority.userInfo.password;
		}
	}

	uri.path = object.path;

	if (object.query !== null) {
		uri.query = new Query();
		uri.query.values = object.query;
	}
	uri.fragment = object.fragment;
}