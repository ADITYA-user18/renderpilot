#!/usr/bin/env node

/**
 * @file cli/index.js
 * @description
 * Main CLI entry point. Wires up Commander and parses arguments.
 */

'use strict';

const { Command } = require('commander');
const { version, description } = require('../../package.json');
const { handleScan } = require('./commands/scan');
const { options } = require('./options');

// Ensure rules are registered before anything runs
require('../rules/index');

const program = new Command();

program
  .name('renderpilot')
  .description(description)
  .version(version);

program
  .command('scan [directory]')
  .description('Scan a React project for performance issues')
  .addOption(options.json)
  .addOption(options.html)
  .addOption(options.score)
  .addOption(options.config)
  .action((directory, cmdOptions) => {
    handleScan(directory, cmdOptions);
  });

// renderpilot report is just an alias for scan --html for now
program
  .command('report [directory]')
  .description('Scan a project and immediately open the HTML report')
  .action((directory) => {
    handleScan(directory, { html: true });
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
