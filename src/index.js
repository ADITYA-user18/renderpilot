/**
 * @file index.js
 * @description
 * Main package export. Allows RenderPilot to be consumed programmatically
 * by other Node.js scripts instead of just via the CLI.
 */

'use strict';

// Ensure rules are registered
require('./rules/index');

const { ProjectScanner } = require('./scanner/ProjectScanner');
const { ScoreCalculator } = require('./score/ScoreCalculator');
const { loadConfig } = require('./config/ConfigLoader');
const { ruleRegistry } = require('./rules/registry/RuleRegistry');

module.exports = {
  // Core APIs
  ProjectScanner,
  ScoreCalculator,
  loadConfig,
  
  // Rule Registry access for custom rules
  ruleRegistry,
  
  // Re-export base rule for custom rule creation
  AbstractRule: require('./rules/base/AbstractRule').AbstractRule,
  
  // Reporters
  TerminalReporter: require('./reporters/TerminalReporter').TerminalReporter,
  JsonReporter: require('./reporters/JsonReporter').JsonReporter,
  HtmlReporter: require('./reporters/HtmlReporter').HtmlReporter,
};
