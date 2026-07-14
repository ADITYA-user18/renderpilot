/**
 * @file scanner/FileScanner.js
 * @description
 * Discovers React source files (.js, .jsx, .ts, .tsx) in the given directory.
 */

'use strict';

const fg = require('fast-glob');
const path = require('path');

class FileScanner {
  /**
   * Find all React source files in the project.
   * @param {string} rootDir
   * @param {import('../types').ResolvedConfig} config
   * @returns {Promise<string[]>} List of absolute file paths
   */
  static async discoverFiles(rootDir, config) {
    // Build ignore patterns
    const ignore = config.ignoreDirs.map(dir => `**/${dir}/**`);
    
    // We only care about JS/TS/JSX/TSX files
    const patterns = [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
    ];

    const files = await fg(patterns, {
      cwd: rootDir,
      ignore,
      absolute: true,
      dot: false,
    });

    return files;
  }
}

module.exports = { FileScanner };
