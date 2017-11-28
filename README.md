# enrich-api-error

Add an API's HTTP response to an error's stack trace for debugging.

[![npm version](https://badge.fury.io/js/enrich-api-error.svg)](https://badge.fury.io/js/enrich-api-error)
[![Build Status](https://travis-ci.org/MediaComem/enrich-api-error.svg?branch=master)](https://travis-ci.org/MediaComem/enrich-api-error)
[![Coverage Status](https://coveralls.io/repos/github/MediaComem/enrich-api-error/badge.svg?branch=master)](https://coveralls.io/github/MediaComem/enrich-api-error?branch=master)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Developed at the [Media Engineering Institute](http://mei.heig-vd.ch) ([HEIG-VD](https://heig-vd.ch)).



## Usage

This is a low-level utility developed as a dependency to [mocha-api-errors](https://github.com/MediaComem/mocha-api-errors).

It's not meant to be used directly, but here's an example using [supertest](https://github.com/visionmedia/supertest) in a [Mocha](https://mochajs.org) test:

```js
const enrichApiError = require('enrich-api-error');
const supertest = require('supertest');

const app = require('./my-express-app');

describe('enrich-api-error', () => {
  it('should add the HTTP response to a stack trace', async () => {

    const res = await supertest(app).get('/test');

    if (res.status != 200) {
      throw enrichApiError(new Error(`Expected status code to be 200, got ${res.status}`), res);
    }
  });
});

// This is an example of the output you could get with a mocha test.
// Note the HTTP response description that has been inserted before
// the error's stack trace:
//
//  something
//    1) should work
//
//  0 passing (50ms)
//  1 failing
//
//  1) something
//       should work:
//
//      Error: Expected status code to be 200, got 400
//
//      HTTP/1.1 400 Bad Request
//      x-powered-by: Express
//      content-type: application/json; charset=utf-8
//      content-length: 13
//      etag: W/"d-pedE0BZFQNM7HX6mFsKPL6l+dUo"
//      date: Tue, 28 Nov 2017 08:58:02 GMT
//      connection: close
//
//      {
//        "foo": "bar"
//      }
//
//      at Context.<anonymous> (spec/index.spec.js:20:21)
//      at <anonymous>
//      at process._tickCallback (internal/process/next_tick.js:188:7)
```
