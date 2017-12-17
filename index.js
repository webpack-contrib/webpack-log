'use strict';

const chalk = require('chalk');
const loglevel = require('loglevelnext'); //eslint-disable-line
const logSymbols = require('log-symbols');

const symbols = {
  trace: chalk.grey('₸'),
  debug: chalk.cyan('➤'),
  info: logSymbols.info,
  warn: logSymbols.warning,
  error: logSymbols.error
};

const defaults = {
  name: '<unknown>',
  level: 'info',
  prefix: {
    level: opts => symbols[opts.level],
    template: `{{level}} ${chalk.gray('｢{{name}}｣')}: `
  }
};

module.exports = function webpackLog(options) {
  const opts = Object.assign({}, defaults, options);

  if (opts.timestamp) {
    opts.prefix.template = `[{{time}}] ${opts.prefix.template}`;
  }

  const log = loglevel.getLogger(opts);

  return log;
};
