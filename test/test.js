'use strict';

/* eslint-disable
  no-console,
  global-require,
  import/order,
  import/no-extraneous-dependencies
*/
const strip = require('strip-ansi');
const weblog = require('../src');

describe('log', () => {
  let consoleInfoMock;
  let consoleWarnMock;
  let consoleDebugMock;
  let consoleTraceMock;
  let consoleErrorMock;

  beforeEach(() => {
    consoleInfoMock = jest.spyOn(console, 'info');
    consoleWarnMock = jest.spyOn(console, 'warn');
    consoleDebugMock = jest.spyOn(console, 'debug');
    consoleTraceMock = jest.spyOn(console, 'trace');
    consoleErrorMock = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    consoleInfoMock.mockRestore();
    consoleWarnMock.mockRestore();
    consoleDebugMock.mockRestore();
    consoleTraceMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it('should exist', () => {
    expect(typeof weblog).toEqual('function');
  });

  it('should provide access to factories', () => {
    expect(typeof weblog.factories.MethodFactory).toEqual('function');
    expect(typeof weblog.factories.PrefixFactory).toEqual('function');
  });

  it('should return a logger', () => {
    const log = weblog({ name: 'wds' });

    expect(log.name).toEqual('wds');
  });

  it('should return multiple unique loggers', () => {
    const log = weblog({ name: 'wds' });
    const log2 = weblog({ name: 'wds' });

    expect(log).not.toEqual(log2);
    expect(log.id).not.toEqual(log2.id);

    expect(log.name).toEqual('wds');
    expect(log2.name).toEqual('wds');

    expect(/^wds/.test(log.id)).toBeTruthy();
    expect(/^wds/.test(log2.id)).toBeTruthy();
  });

  it('should return cached loggers', () => {
    const log = weblog({ name: 'wds', unique: false });
    const log2 = weblog({ name: 'wds', unique: false });

    expect(log).toEqual(log2);

    expect(log.id).toEqual('wds');
    expect(log2.id).toEqual('wds');
    expect(log.id).toEqual(log2.id);

    expect(log.name).toEqual('wds');
    expect(log2.name).toEqual('wds');
    expect(log.name).toEqual(log2.name);
  });

  it('should log for unique loggers', () => {
    const log = weblog({ name: 'wds' });
    const log2 = weblog({ name: 'wdm' });

    log.info('webpack-dev-server');
    log2.info('webpack-dev-middleware');

    const [first, last] = consoleInfoMock.mock.calls;

    expect(strip(first[0])).toMatchSnapshot();
    expect(strip(last[0])).toMatchSnapshot();
  });

  it('should delete a logger (for tests environments only)', () => {
    const log = weblog({ name: 'wds' });

    weblog.delLogger('wds');

    const log2 = weblog({ name: 'wds' });

    expect(log).not.toEqual(log2);
  });

  it('cached loggers should share log levels', () => {
    const log = weblog({ name: 'wds', id: 'foo' });

    log.level = 'silent';

    const log2 = weblog({ name: 'wds', id: 'foo' });

    expect(log).toEqual(log2);
    expect(log.level).toEqual(log2.level);
  });

  it('should return no color string', () => {
    const log = weblog({ name: 'wds', color: false });

    log.info('webpack-dev-server');

    const [first] = consoleInfoMock.mock.calls;

    expect(first[0]).toMatchSnapshot();
  });

  it('should return logs with prefix', () => {
    const log = weblog({ name: 'wds', id: 'foo' });

    {
      log.level = 'trace';
      log.trace('webpack-dev-server');

      const [first] = consoleTraceMock.mock.calls;

      expect(strip(first[0])).toMatchSnapshot();
    }

    {
      log.level = 'info';
      log.info('webpack-dev-server');

      const [first] = consoleInfoMock.mock.calls;

      expect(strip(first[0])).toMatchSnapshot();
    }

    {
      log.level = 'warn';
      log.warn('webpack-dev-server');

      const [first] = consoleWarnMock.mock.calls;

      expect(strip(first[0])).toMatchSnapshot();
    }

    {
      log.level = 'error';
      log.error('webpack-dev-server');

      const [first] = consoleErrorMock.mock.calls;

      expect(strip(first[0].split('\n')[0])).toMatchSnapshot();
    }
  });

  it('should attach timestamp', () => {
    const log = weblog({ name: 'wds', timestamp: true });

    log.info('webpack-dev-server');

    const [first] = consoleInfoMock.mock.calls;

    expect(!!first[0].match(/[\d\d:\d\d:\d\d]/)).toBeTruthy();
  });
});
