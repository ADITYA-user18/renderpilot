/**
 * @file config/ConfigLoader.js
 * @description
 * Loads and merges user configuration from renderpilot.config.js
 * with built-in defaults. Performs validation and normalization.
 *
 * Resolution order:
 *   1. Look for renderpilot.config.js in the scan root
 *   2. Look for renderpilot.config.js in process.cwd()
 *   3. Fall back to DEFAULT_CONFIG
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { DEFAULT_CONFIG } = require('./DefaultConfig');

/**
 * Attempts to load a renderpilot.config.js file from the given directory.
 * @param {string} dir - Directory to search in
 * @returns {import('../types').UserConfig|null} User config or null if not found
 */
function loadConfigFile(dir) {
  const configPath = path.join(dir, 'renderpilot.config.js');
  if (!fs.existsSync(configPath)) return null;

  try {
    // Clear require cache to support hot-reloading in watch mode
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch (err) {
    console.warn(
      `[RenderPilot] Warning: Failed to load config at ${configPath}: ${err.message}`
    );
    return null;
  }
}

/**
 * Merges user config with defaults and normalizes into a ResolvedConfig.
 * @param {import('../types').UserConfig} userConfig - User-provided config
 * @returns {import('../types').ResolvedConfig} Resolved config
 */
function mergeConfig(userConfig) {
  const merged = { ...DEFAULT_CONFIG };

  if (Array.isArray(userConfig.ignoreDirs)) {
    // Merge user ignore dirs with defaults (union)
    merged.ignoreDirs = [
      ...new Set([...DEFAULT_CONFIG.ignoreDirs, ...userConfig.ignoreDirs]),
    ];
  }

  if (typeof userConfig.maxComponentLines === 'number' && userConfig.maxComponentLines > 0) {
    merged.maxComponentLines = userConfig.maxComponentLines;
  }

  if (userConfig.severityOverrides && typeof userConfig.severityOverrides === 'object') {
    merged.severityOverrides = { ...userConfig.severityOverrides };
  }

  if (Array.isArray(userConfig.enabledRules) && userConfig.enabledRules.length > 0) {
    merged.enabledRules = new Set(userConfig.enabledRules);
  }

  if (Array.isArray(userConfig.disabledRules) && userConfig.disabledRules.length > 0) {
    merged.disabledRules = new Set(userConfig.disabledRules);
  }

  if (typeof userConfig.outputDir === 'string' && userConfig.outputDir.trim()) {
    merged.outputDir = userConfig.outputDir.trim();
  }

  merged.hasCustomConfig = true;
  return merged;
}

/**
 * Loads and resolves configuration for a scan.
 * Searches scanRoot first, then cwd, then uses defaults.
 *
 * @param {string} scanRoot - The root directory being scanned
 * @returns {import('../types').ResolvedConfig} Fully resolved config
 */
function loadConfig(scanRoot) {
  // Try scan root first
  let userConfig = loadConfigFile(scanRoot);

  // Fall back to cwd if not in scan root
  if (!userConfig && scanRoot !== process.cwd()) {
    userConfig = loadConfigFile(process.cwd());
  }

  if (!userConfig) {
    return { ...DEFAULT_CONFIG };
  }

  return mergeConfig(userConfig);
}

module.exports = { loadConfig };
