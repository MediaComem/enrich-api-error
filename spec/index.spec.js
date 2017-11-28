/* istanbul ignore file */
const { expect } = require('chai');
const _ = require('lodash');

const enrichApiError = require('../');

describe('enrich-api-error', () => {
  it('should add the description of an HTTP response to a mock error\'s stack trace', () => {

    const err = {
      message: 'bug',
      stack: 'bug\n  at foo:1\n  at bar:2'
    };

    const res = mockHttpResponse({
      body: 'foobar',
      headers: {
        foo: 'bar',
        baz: 'qux'
      },
      status: 200
    });

    const enrichedErr = enrichApiError(err, res);
    expect(enrichedErr.stack).to.eql(`bug\n  HTTP/1.1 200 OK\n  foo: bar\n  baz: qux\n  \n  foobar\n\n  at foo:1\n  at bar:2`);
    expect(enrichedErr).to.equal(err);
  });

  it('should add the description of an HTTP response to a mock error\'s stack trace with no indentation', () => {

    const err = {
      message: 'bug',
      stack: 'bug\nat foo:1\nat bar:2'
    };

    const res = mockHttpResponse({
      body: 'foobar',
      headers: {
        foo: 'bar',
        baz: 'qux'
      },
      status: 200
    });

    const enrichedErr = enrichApiError(err, res);
    expect(enrichedErr.stack).to.eql(`bug\nHTTP/1.1 200 OK\nfoo: bar\nbaz: qux\n\nfoobar\n\nat foo:1\nat bar:2`);
    expect(enrichedErr).to.equal(err);
  });

  it('should add the description of an HTTP response to a real error\'s stack trace', () => {

    const err = new Error('bug');
    const stack = err.stack;

    const res = mockHttpResponse({
      body: 'foobar',
      headers: {
        foo: 'bar',
        baz: 'qux'
      },
      status: 200
    });

    const resString = 'HTTP/1.1 200 OK\nfoo: bar\nbaz: qux\n\nfoobar';

    const enrichedErr = enrichApiError(err, res);

    const stackFirstLine = stack.replace(/\n.*/gm, '');
    const stackOtherLines = stack.slice(stackFirstLine.length + 1);

    const stackIndentMatch = stackOtherLines.match(/^\s+/);
    const stackIndent = stackIndentMatch ? stackIndentMatch[0] : '';

    expect(enrichedErr.stack).to.eql(`${stackFirstLine}\n${resString.replace(/^/gm, stackIndent)}\n\n${stackOtherLines}`);
    expect(enrichedErr).to.equal(err);
  });

  describe('responseToString', () => {

    let responseToString = enrichApiError.responseToString;

    it('should print an HTTP response as a string', async function() {

      const res = mockHttpResponse({
        body: 'foobar',
        headers: {
          foo: 'bar',
          baz: 'qux'
        },
        status: 200
      });

      const string = responseToString(res);
      expect(string).to.eql('HTTP/1.1 200 OK\nfoo: bar\nbaz: qux\n\nfoobar');
    });

    it('should print an HTTP response as a string with JSON content pretty-printed', async function() {

      const res = mockHttpResponse({
        body: { foo: 'bar' },
        headers: {
          'content-type': 'application/json',
          foo: 'bar',
          baz: 'qux'
        },
        status: 200
      });

      const string = responseToString(res);
      expect(string).to.eql('HTTP/1.1 200 OK\ncontent-type: application/json\nfoo: bar\nbaz: qux\n\n{\n  "foo": "bar"\n}');
    });
  });
});

function mockHttpResponse(options) {

  const mock = _.defaults({}, options, {
    headers: {},
    httpVersion: '1.1'
  });

  mock.get = name => mock.headers[name.toLowerCase()];

  return mock;
}
