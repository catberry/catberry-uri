#URI parser for Catberry Framework 3.0 [![Build Status](https://travis-ci.org/catberry/catberry-uri.png?branch=master)](https://travis-ci.org/catberry/catberry-uri) [![Coverage Status](https://coveralls.io/repos/catberry/catberry-uri/badge.png)](https://coveralls.io/r/catberry/catberry-uri)
[![NPM](https://nodei.co/npm/catberry-uri.png)](https://nodei.co/npm/catberry-uri/)

##Description
This is well-tested URI parser implementation that has been developed strictly
according to [RFC 3986](https://tools.ietf.org/html/rfc3986).

It supports punycode for URI authority host component and percent-encoding for
all URI components except scheme and port. Percent encoding/decoding
happens automatically.

It validates scheme and port component values during URI recombination.

It implements relative reference resolution algorithm from
[RFC 3986 5.2](https://tools.ietf.org/html/rfc3986#section-5.2).

##Usage

###Parse URI
```javascript
var catberryURI = require('catberry-uri'),
	URI = catberryURI.URI,
	Authority = catberryURI.Authority,
	UserInfo = catberryURI.UserInfo,
	Query = catberryURI.Query;

var uri = new URI('http://user:pass@example.org:3000/some/path?some=value&some2=value&some2=value2&some3#fragment');
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

###Get URI string
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

###Building new URI
Also every URI component including URI itself has `clone` method to create
a cloned URI component for building another URI.

You can create new empty URI like this:
```javascript
var uri = new URI();
uri.scheme = 'http';
uri.authority = new Authority();
uri.authority.userInfo = new UserInfo();
uri.authority.userInfo.user = 'user';
uri.authority.userInfo.password = 'pass';
uri.authority.host = 'example.org';
uri.authority.port = '3000';
uri.path = '/some/path';
uri.query = new Query();
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

###Resolve relative URI
Also you can resolve any relative URI using base URI.
```javascript
var uri = new URI('../../../../g'),
	baseUri = new URI('http://a/b/c/d;p?q');

var absoluteUri = uri.resolveRelative(baseUri);
console.log(absoluteUri.toString()); // http://a/g
```

##Contribution
If you have found a bug, please create pull request with [mocha](https://www.npmjs.org/package/mocha) 
unit-test which reproduces it or describe all details in issue if you can not 
implement test. If you want to propose some improvements just create issue or 
pull request but please do not forget to use `npm test` to be sure that your 
code is awesome.

All changes should satisfy this [Code Style Guide](https://github.com/catberry/catberry/blob/master/docs/code-style-guide.md).

Also your changes should be covered by unit tests using [mocha](https://www.npmjs.org/package/mocha).

Denis Rechkunov <denis.rechkunov@gmail.com>