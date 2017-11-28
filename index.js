const httpStatuses = require('http-status');
const { inherits } = require('util');

module.exports = enrichError;
module.exports.responseToString = responseToString;

function enrichError(err, res) {

  let preStack = err.stack;
  while (preStack.match(/^\s*at[^\n]+$/m)) {
    preStack = preStack.replace(/\n[^\n]+$/m, '');
  }

  const indentMatch = err.stack.slice(preStack.length + 1).match(/^\s+/);
  const indent = indentMatch ? indentMatch[0] : '';

  const response = responseToString(res).replace(/^/gm, indent);

  err.stack = `${preStack}\n${response}\n\n${err.stack.slice(preStack.length + 1)}`;

  return err;
}

function responseToString(res) {

  let desc = `HTTP/${res.httpVersion} ${res.status}`;

  const code = httpStatuses[res.status];
  if (code) {
    desc = `${desc} ${code}`;
  }

  for (let header in res.headers) {
    const value = res.headers[header];
    desc = `${desc}\n${header}: ${value}`;
  }

  if (res.body) {
    desc = `${desc}\n\n`;

    const contentType = res.get('Content-Type');
    if (contentType && contentType.match(/^application\/json/)) {
      desc = `${desc}${JSON.stringify(res.body, null, 2)}`;
    } else {
      desc = `${desc}${res.body.toString()}`;
    }
  }

  return desc;
};
