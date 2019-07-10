'use strict';

/* eslint-disable
  no-console,
  global-require,
  import/order,
  import/no-extraneous-dependencies
*/
const assert = require('assert');

const sinon = require('sinon');
const strip = require('strip-ansi');

const weblog = require('../src');

describe('log', () => {
  const sandbox = sinon.createSandbox();

  before(() => {
    sandbox.spy(console, 'info');
  });

  afterEach(() => {
    console.info.resetHistory();
  });

  after(() => {
    sandbox.restore();
  });

  it('should exist', () => {
    assert(weblog);
    assert.equal(typeof weblog, 'function');
  });

  it('should provide access to factories', () => {
    assert(weblog.factories);
    assert(weblog.factories.MethodFactory);
  });

  it('should return a logger', () => {
    const log = weblog({ name: 'wds' });

    assert(log);
    assert.equal(log.name, 'wds');
  });

  it('should return multiple unique loggers', () => {
    const log = weblog({ name: 'wds' });
    const log2 = weblog({ name: 'wds' });

    assert.notDeepEqual(log, log2);

    assert.equal(log.name, 'wds');
    assert.equal(log2.name, 'wds');

    assert(/^wds/.test(log.id));
    assert(/^wds/.test(log2.id));

    assert.notEqual(log.id, log2.id);
  });

  it('should return cached loggers', () => {
    const log = weblog({ name: 'wds', unique: false });
    const log2 = weblog({ name: 'wds', unique: false });

    assert.deepEqual(log, log2);

    assert.equal(log.name, 'wds');
    assert.equal(log2.name, 'wds');
    assert.equal(log.id, 'wds');
    assert.equal(log2.id, 'wds');
    assert.equal(log.id, log2.id);
  });

  it('should log for unique loggers', () => {
    const log = weblog({ name: 'wds' });
    const log2 = weblog({ name: 'wdm' });

    log.info('webpack-dev-server');
    log2.info('webpack-dev-middleware');

    const [first] = console.info.firstCall.args;
    const [last] = console.info.lastCall.args;

    assert.equal(console.info.callCount, 2);
    assert.equal(strip(first), 'ℹ ｢wds｣: webpack-dev-server');
    assert.equal(strip(last), 'ℹ ｢wdm｣: webpack-dev-middleware');
  });

  it('should delete a logger (for tests environments only)', () => {
    const log = weblog({ name: 'wds' });

    weblog.delLogger('wds');

    const log2 = weblog({ name: 'wds' });

    assert.notDeepEqual(log, log2);
  });

  it('cached loggers should share log levels', () => {
    const log = weblog({ name: 'wds', id: 'foo' });

    log.level = 'silent';

    const log2 = weblog({ name: 'wds', id: 'foo' });

    assert.deepEqual(log, log2);
    assert.equal(log.level, log.level);
  });

  it('should return no color string', () => {
    const log = weblog({ name: 'wds', color: false });

    log.info('webpack-dev-server');

    const [first] = console.info.firstCall.args;

    assert.equal(first, '｢wds｣: webpack-dev-server');
  });
});
