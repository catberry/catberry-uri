# URI Parser for Catberry Framework

[![Build Status](https://travis-ci.org/catberry/catberry-uri.svg?branch=master)](https://travis-ci.org/catberry/catberry-uri) [![codecov.io](http://codecov.io/github/catberry/catberry-uri/coverage.svg?branch=master)](http://codecov.io/github/catberry/catberry-uri?branch=master)

## Installation

```bash
npm install catberry-uri
```

## Description
This is well-tested URI parser implementation that has been developed strictly
according to [RFC 3986](https://tools.ietf.org/html/rfc3986).

It supports percent-encoding for all URI components except scheme and port.
Percent encoding/decoding happens automatically.

It validates scheme and port component values during URI recombination.

It implements relative reference resolution algorithm from
[RFC 3986 5.2](https://tools.ietf.org/html/rfc3986#section-5.2).

## Usage

### Parse URI

```javascript
const catberryURI = require('catberry-uri');
const URI = catberryURI.URI;
const uri = new URI('http://user:pass@example.org:3000/some/path?some=value&some2=value&some2=value2&some3#fragment');
console.log(uri);
```

And you will get such object

```javascript
 scheme: 'http',
  authority:
   { userInfo: { user: 'user', password: 'pass' },
     port: '3000',
     host: 'example.org' },
  path: '/some/path',
  query: { values: { some: 'value', some2: [ 'value', 'value2' ], some3: null } },
  fragment: 'fragment' }
```
This object is instance of `URI` constructor, `authority` field is instance
of `Authority`, `authority.userInfo` is instance of `UserInfo` and `query` is
instance of `Query`.

### Get URI string
You can safely edit every component of parsed URI and then get URI string back.
When you convert URI object to string scheme and port values are validated and
could throw exception if values are not satisfy `/^[a-z]+[a-z\d\+\.-]*$/i` and
/`^\d+$/` respectively.

To get string representation of all these URI components just use `toString()`

```javascript
uri.authority.userInfo.toString(); // user:pass
uri.authority.toString(); // user:pass@example.org:3000
uri.query.toString(); // some=value&some2=value
console.log(uri.toString());
// http://user:pass@example.org:3000/some/path?some=value&some2=value&some2=value2&some3#fragment
```

### Building new URI
Also, every URI component including URI itself has `clone` method to create
a cloned URI component for building another URI.

You can create new empty URI like this:
```javascript
const uri = new URI();
uri.scheme = 'http';
// there is a static method in the URI class
uri.authority = URI.createAuthority();
// and also, an instance method
uri.authority.userInfo = uri.createUserInfo();
uri.authority.userInfo.user = 'user';
uri.authority.userInfo.password = 'pass';
uri.authority.host = 'example.org';
uri.authority.port = '3000';
uri.path = '/some/path';
uri.query = uri.createQuery();
uri.query.values = {
	some: 'value',
	some2: [ 'value', 'value2' ],
	some3: null
}
uri.fragment = 'fragment';

console.log(uri.toString());
// http://user:pass@example.org:3000/some/path?some=value&some2=value&some2=value2&some3#fragment
```
All URI components are optional and `null` by default.
`null` and `undefined` values of every component are ignored otherwise any value
will be converted to string.

### Resolve relative URI
Also, you can resolve any relative URI using base URI.

```javascript
const uri = new URI('../../../../g');
const baseUri = new URI('http://a/b/c/d;p?q');

const absoluteUri = uri.resolveRelative(baseUri);
console.log(absoluteUri.toString()); // http://a/g
```

### Interface

```javascript
class URI {

	/**
	 * Creates a new URI authority component.
	 * @param {string?} Existing string.
	 * @return {Authority} The authority component.
	 */
	static createAuthority(string) {}

	/**
	 * Creates a new URI authority component.
	 * @param {string?} Existing string.
	 * @return {Authority} The authority component.
	 */
	createAuthority(string) {}

	/**
	 * Creates a new URI user info component.
	 * @param {string?} Existing string.
	 * @return {UserInfo} The user info component.
	 */
	static createUserInfo(string) {}

	/**
	 * Creates a new URI user info component.
	 * @param {string?} Existing string.
	 * @return {UserInfo} The user info component.
	 */
	createUserInfo(string) {}

	/**
	 * Creates a new URI query component.
	 * @param {string?} Existing string.
	 * @return {Query} The query component.
	 */
	static createQuery(string)}

	/**
	 * Creates a new URI query component.
	 * @param {string?} Existing string.
	 * @return {Query} The query component.
	 */
	createQuery(string) {}

	/**
	 * Creates new instance of URI according to RFC 3986.
	 * @param {string?} uriString URI string to parse components.
	 */
	constructor(uriString) {}

	/**
	 * Converts a URI reference that might be relative to a given base URI
	 * into the reference's target URI.
	 * https://tools.ietf.org/html/rfc3986#section-5.2
	 * @param {URI} baseUri Base URI.
	 * @returns {URI} Resolved URI.
	 */
	resolveRelative(baseUri) {}

	/**
	 * Clones current URI to a new object.
	 * @returns {URI} New clone of current object.
	 */
	clone() {}

	/**
	 * Recomposes URI components to URI string,
	 * https://tools.ietf.org/html/rfc3986#section-5.3
	 * @returns {string} URI string.
	 */
	toString() {}
}
```

## Contributing

There are a lot of ways to contribute:

* Give it a star
* Join the [Gitter](https://gitter.im/catberry/main) room and leave a feedback or help with answering users' questions
* [Submit a bug or a feature request](https://github.com/catberry/catberry-uri/issues)
* [Submit a PR](https://github.com/catberry/catberry-uri/blob/develop/CONTRIBUTING.md)

Denis Rechkunov <denis@rdner.de>
