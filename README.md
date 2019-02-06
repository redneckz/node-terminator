# node-terminator

Handle NodeJS termination (SIGTERM/SIGINT) gracefully.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

## Installation

```shell
npm install --save @redneckz/node-terminator
```

## How-to

1. Create *NodeTerminator* terminator instance and attach it to *NodeJS* process (several instances can be created and attached).

```javascript
const { NodeTerminator } = require('@redneckz/node-terminator');

const nodeTerminator = new NodeTerminator();
nodeTerminator.attach(() => {
  // Some additional steps before exit
  process.exit();
});
```

2. Decorate async jobs to control gracefull shutdown

```javascript
const {
  graceful, // HOF bound to NodeTerminator instance
} = nodeTerminator;

const someJob = graceful(async () => {
  // Do something asynchronously
  console.log('Working hard...');
});
```

# License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://badge.fury.io/js/%40redneckz%2Fnode-terminator.svg
[npm-url]: https://www.npmjs.com/package/%40redneckz%2Fnode-terminator
[travis-image]: https://travis-ci.org/redneckz/node-terminator.svg?branch=master
[travis-url]: https://travis-ci.org/redneckz/node-terminator
[coveralls-image]: https://coveralls.io/repos/github/redneckz/node-terminator/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/redneckz/node-terminator?branch=master
