'use strict';

/* eslint-disable
  no-shadow,
  no-console,
  no-param-reassign,
  import/order,
  space-before-function-paren
*/
const sinon = require('sinon');
const assert = require('assert');

const LogLevel = require('../../src/loglevel/LogLevel');
const PrefixFactory = require('../../src/loglevel/PrefixFactory');

describe('PrefixFactory', () => {
  const sandbox = sinon.sandbox.create();

  let log;
  let factory;

  before(() => {
    sandbox.spy(console, 'info');

    log = new LogLevel({
      level: 'trace',
      name: 'test',
      prefix: {}
    });

    factory = log.factory; // eslint-disable-line
  });

  afterEach(() => {
    console.info.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('created a PrefixFactory', () => {
    assert(factory instanceof PrefixFactory);
  });

  it('gets the name from the base logger', () => {
    assert.equal(factory.options.name({ logger: log }), 'test');
  });

  it('prefixes output', () => {
    log.info('foo');

    const [first] = console.info.firstCall.args;

    assert.equal(console.info.callCount, 1);
    assert(/\d{2}:\d{2}:\d{2}\s\[info\]\sfoo/.test(first));
  });

  it('prefixes output with custom options', () => {
    const options = {
      name (options) {
        return options.logger.name.toUpperCase();
      },
      time () {
        return `[${new Date().toTimeString().split(' ')[0].split(':')[0]}]`;
      },
      level (options) {
        return `[${options.level.substring(1)}]`;
      },
      template: '{{time}} {{level}} ({{name}}) {{nope}}-'
    };

    const prefix = new PrefixFactory(log, options);

    log.factory = prefix;
    log.info('foo');

    const [first] = console.info.firstCall.args;
    const terped = prefix.interpolate('info');
    const output = /\[\d{2}\]\s\[nfo\]\s\(TEST\)\s\{\{nope\}\}-/;

    assert(output.test(terped));

    assert.equal(console.info.callCount, 1);

    assert(/\[\d{2}\]\s\[nfo\]\s\(TEST\)\s\{\{nope\}\}-foo/.test(first));

    // test the first argument when passing a non-string
    log.info({});

    const [last] = console.info.lastCall.args;

    assert(output.test(last));
  });

  it('supports different prefixes per logger', () => {
    const log2 = new LogLevel({
      name: 'test',
      level: 'trace',
      prefix: { template: 'baz ' }
    });

    log.info('foo');
    log2.info('foo');

    const [first] = console.info.firstCall.args;
    const [last] = console.info.lastCall.args;

    assert.equal(console.info.callCount, 2);
    assert.notEqual(first, last);
  });
});
