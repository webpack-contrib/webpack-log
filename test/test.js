'use strict';

/* eslint no-console: off, import/no-extraneous-dependencies: off */

const assert = require('assert');
const sinon = require('sinon');
const strip = require('strip-ansi');
const weblog = require('../');

/**
 * @note loglevelnext takes care of handling most output tests.
 *       we add a few here just for sanity checking
 */

describe('webpack-log', () => {
  const sandbox = sinon.sandbox.create();

  before(() => {
    sandbox.spy(console, 'info');
  });

  afterEach(() => {
    console.info.reset();
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
    const log2 = weblog({ name: 'wdm' });

    assert.notDeepEqual(log, log2);
    assert.equal(log.name, 'wds');
    assert.equal(log2.name, 'wdm');
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
});
