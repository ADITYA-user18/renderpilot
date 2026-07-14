/**
 * @file cli/options.js
 * @description
 * Reusable Commander.js options shared across multiple commands.
 */

'use strict';

const { Option } = require('commander');

const options = {
  json: new Option('--json', 'Output results as a JSON file').default(false),
  html: new Option('--html', 'Output results as an interactive HTML report').default(false),
  score: new Option('--score', 'Only print the overall performance score').default(false),
  config: new Option('-c, --config <path>', 'Path to custom config file'),
};

module.exports = { options };
