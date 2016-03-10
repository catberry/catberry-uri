'use strict';

const assert = require('assert');
const recombineNormal = require('../recombine-normal.json');
const parseNonEncoded = require('../parse-non-encoded.json');
const parseEncoded = require('../parse-encoded.json');
const rfcNormal = require('../rfc3986-specs-normal.json');
const rfcAbnormal = require('../rfc3986-specs-abnormal.json');
const URI = require('../../lib/URI');
const Authority = require('../../lib/Authority');
const Query = require('../../lib/Query');
const UserInfo = require('../../lib/UserInfo');

/* eslint max-nested-callbacks: [2, 7]*/
describe('lib/URI', () => {
	describe('constructor', () => {
		it('should create proper URI object with empty value', () => {
			const uri = new URI();
			assert.strictEqual(uri.scheme, null);
			assert.strictEqual(uri.authority, null);
			assert.strictEqual(uri.path, '');
			assert.strictEqual(uri.query, null);
			assert.strictEqual(uri.fragment, null);
		});
		it('should create proper URI object with not string', () => {
			const uri = new URI({});
			assert.strictEqual(uri.scheme, null);
			assert.strictEqual(uri.authority, null);
			assert.strictEqual(uri.path, '');
			assert.strictEqual(uri.query, null);
			assert.strictEqual(uri.fragment, null);
		});
		describe('Parsing URI without encodings', () => {
			parseNonEncoded.items.forEach(item => {
				it(`should properly parse ${item.name}`, () => {
					const uri = new URI(item.uri);
					const expected = item.expected;
					compareURI(uri, expected);
				});
			});
		});

		describe('Parsing URI with percent encoding', () => {
			parseEncoded.items.forEach(item => {
				it(`should properly parse ${item.name}`, () => {
					const uri = new URI(item.uri);
					const expected = item.expected;
					compareURI(uri, expected);
				});
			});
		});
	});
	describe('#clone', () => {
		it('should clone whole URI object and all inner components', () => {
			const uri = new URI(
				'http://user:pass@example.org:3000/some/path?some=value&some2=value#fragment'
			);
			const clone = uri.clone();
			assert.notEqual(clone, uri);
			assert.notEqual(clone.authority, uri.authority);
			assert.notEqual(clone.authority.userInfo, uri.authority.userInfo);
			assert.notEqual(clone.query, uri.query);
			assert.strictEqual(clone.scheme, uri.scheme);
			assert.strictEqual(clone.authority.userInfo.user, uri.authority.userInfo.user);
			assert.strictEqual(clone.authority.userInfo.password, uri.authority.userInfo.password);
			assert.strictEqual(clone.authority.host, uri.authority.host);
			assert.strictEqual(clone.authority.port, uri.authority.port);
			assert.strictEqual(clone.path, uri.path);
			Object.keys(clone.query.values)
				.forEach(key => {
					assert.strictEqual(clone.query.values[key], uri.query.values[key]);
				});
			assert.strictEqual(clone.fragment, uri.fragment);
		});
	});
	describe('#toString', () => {
		it('should throw an error if port contains a wrong value', () => {
			const uri = new URI('http://localhost:80/');
			uri.authority.port = 'wrong';
			assert.throws(() => {
				uri.toString();
			});
		});
		it('should throw an error if scheme contains a wrong character', () => {
			const uri = new URI('http://localhost:80/');
			uri.scheme = 'wr/ong';
			assert.throws(() => {
				uri.toString();
			});
		});
		it('should recombine URI object with empty value to empty string', () => {
			const uri = new URI();
			assert.strictEqual(uri.toString(), '');
		});
		describe('Recombine to the non-encoded string', () => {
			parseNonEncoded.items.forEach(item => {
				it(`should properly recombine ${item.name}`, () => {
					const uri = new URI();
					fillWithObject(uri, item.expected);
					assert.strictEqual(uri.toString(), item.uri);
				});
			});
		});
		describe('Recombine to the encoded string', () => {
			parseEncoded.items.forEach(item => {
				it(`should properly recombine ${item.name}`, () => {
					const uri = new URI();
					fillWithObject(uri, item.expected);
					assert.strictEqual(uri.toString(), item.uri);
				});
			});
		});
		describe('Parse and recombine to the same string', () => {
			recombineNormal.items.forEach(item => {
				it(`URI String = "${item}"`, () => {
					const uri = new URI(item);
					assert.strictEqual(uri.toString(), item);
				});
			});
		});

		it('should throw error when scheme is a bad value', () => {
			const uri = new URI();
			uri.scheme = '!@#';
			assert.throws(() => window.console.log(uri.toString()));
		});
		it('should throw error when port is a bad value', () => {
			const uri = new URI('http://example.org:3000');

			uri.authority.port = '!@#';
			assert.throws(() => window.console.log(uri.toString()));
		});
		it('should properly handle null as query.values', () => {
			const uri = new URI();
			uri.query = new Query();
			uri.query.values = null;
			assert.strictEqual(uri.toString(), '?');
		});
		it('should properly stringify non-string query.values', () => {
			const uri = new URI();
			uri.query = new Query();
			uri.query.values = {
				number: 1,
				bool: true,
				nullValue: null,
				some: undefined,
				obj: {}
			};
			assert.strictEqual(
				uri.toString(),
				'?number=1&bool=true&nullValue&some&obj=%5Bobject%20Object%5D'
			);
		});
	});
	describe('#resolveRelative', () => {
		it('should throw an error if a base URI has no scheme', () => {
			const uri = new URI('http://localhost/some');
			assert.throws(() => {
				uri.resolveRelative('//locahost/');
			});
		});
		describe('RFC 3986 5.4.1', () => {
			const baseUri = new URI(rfcNormal.baseUri);
			rfcNormal.tests.forEach(item => {
				const title = `${rfcNormal.baseUri}->${item.test} = ${item.expected}`;
				it(title, () => {
					const referenceUri = new URI(item.test);
					const resolvedUri = referenceUri.resolveRelative(baseUri);
					assert.strictEqual(resolvedUri.toString(), item.expected);
				});
			});
		});
		describe('RFC 3986 5.4.2', () => {
			const baseUri = new URI(rfcAbnormal.baseUri);
			rfcAbnormal.tests.forEach(item => {
				const title = `${rfcAbnormal.baseUri}->${item.test} = ${item.expected}`;
				it(title, () => {
					const referenceUri = new URI(item.test);
					const resolvedUri = referenceUri.resolveRelative(baseUri);
					assert.strictEqual(resolvedUri.toString(), item.expected);
				});
			});
		});
		it('should throw error if base URI has no scheme', () => {
			const uri = new URI('/example/some/../path');
			const baseUri = new URI('//example.org:3000');

			assert.throws(() => window.console.log(uri.resolveRelative(baseUri)));
		});
	});
});

/**
 * Compare URI
 * @param uri
 * @param object
 */
function compareURI(uri, expected) {
	assert.strictEqual(uri.scheme, expected.scheme);
	if (expected.authority === null) {
		assert.strictEqual(uri.authority, null);
	} else {
		assert.strictEqual(uri.authority.host, expected.authority.host);
		assert.strictEqual(uri.authority.port, expected.authority.port);
		if (expected.authority.userInfo === null) {
			assert.strictEqual(uri.authority.userInfo, null);
		} else {
			assert.strictEqual(uri.authority.userInfo.user, expected.authority.userInfo.user);
			assert.strictEqual(uri.authority.userInfo.password, expected.authority.userInfo.password);
		}
	}

	assert.strictEqual(uri.path, expected.path);

	if (expected.query === null) {
		assert.strictEqual(uri.query, null);
	} else {
		assert.strictEqual(Object.keys(uri.query.values).length, Object.keys(expected.query).length);
		Object.keys(expected.query)
			.forEach(key => {
				assert.strictEqual(uri.query.values[key], expected.query[key]);
			});
	}
	assert.strictEqual(uri.fragment, expected.fragment);
}

/**
 * Fill with object
 * @param uri
 * @param object
 */
function fillWithObject(uri, object) {
	uri.scheme = object.scheme;
	if (object.authority !== null) {
		uri.authority = new Authority();
		uri.authority.host = object.authority.host;
		uri.authority.port = object.authority.port;
		if (object.authority.userInfo !== null) {
			uri.authority.userInfo = new UserInfo();
			uri.authority.userInfo.user = object.authority.userInfo.user;
			uri.authority.userInfo.password = object.authority.userInfo.password;
		}
	}

	uri.path = object.path;

	if (object.query !== null) {
		uri.query = new Query();
		uri.query.values = object.query;
	}
	uri.fragment = object.fragment;
}
