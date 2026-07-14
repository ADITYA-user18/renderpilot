/**
 * @file config/DefaultConfig.js
 * @description Built-in default configuration for RenderPilot.
 * All defaults live here — never scattered across modules.
 */

'use strict';

/** @type {import('../types').ResolvedConfig} */
const DEFAULT_CONFIG = {
  ignoreDirs: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.git',
    '.next',
    '.nuxt',
    'out',
    '.cache',
    'public',
    'static',
    'assets',
  ],
  maxComponentLines: 300,
  severityOverrides: {},
  enabledRules: null,       // null = all rules enabled
  disabledRules: new Set(),
  outputDir: '.renderpilot',
  hasCustomConfig: false,
};

module.exports = { DEFAULT_CONFIG };
