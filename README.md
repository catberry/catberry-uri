#URI parser for Catberry Framework 3.0 [![Build Status](https://travis-ci.org/catberry/catberry-uri.png?branch=master)](https://travis-ci.org/catberry/catberry-uri) [![Coverage Status](https://coveralls.io/repos/catberry/catberry-uri/badge.png)](https://coveralls.io/r/catberry/catberry-uri)
[![NPM](https://nodei.co/npm/catberry-uri.png)](https://nodei.co/npm/catberry-uri/)

##Description
This is well-tested URI parser implementation that has been developed strictly
according to [RFC 3986](https://tools.ietf.org/html/rfc3986).

It supports punycode for URI host component and percent-encoding for
all URI components except scheme and port. Percent encoding/decoding
happens automatically.

It validates scheme and port component values during URI recombination.

It implements relative reference resolution algorithm from
[RFC 3986 5.2](https://tools.ietf.org/html/rfc3986#section-5.2).

##Usage


##Contribution
If you have found a bug, please create pull request with [mocha](https://www.npmjs.org/package/mocha) 
unit-test which reproduces it or describe all details in issue if you can not 
implement test. If you want to propose some improvements just create issue or 
pull request but please do not forget to use `npm test` to be sure that your 
code is awesome.

All changes should satisfy this [Code Style Guide](https://github.com/catberry/catberry/blob/master/docs/code-style-guide.md).

Also your changes should be covered by unit tests using [mocha](https://www.npmjs.org/package/mocha).

Denis Rechkunov <denis.rechkunov@gmail.com>