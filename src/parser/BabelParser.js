/**
 * @file parser/BabelParser.js
 * @description
 * Wrapper around @babel/parser that handles JS, TS, JSX, and TSX.
 * Provides consistent error handling and plugin selection.
 */

'use strict';

const { parse } = require('@babel/parser');

/**
 * Babel parser plugins enabled for all files.
 * Handles JSX, TypeScript, and common modern JS syntax.
 * @type {import('@babel/parser').ParserPlugin[]}
 */
const BASE_PLUGINS = [
  'jsx',
  'typescript',
  'decorators-legacy',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'optionalChaining',
  'nullishCoalescingOperator',
  'objectRestSpread',
  'dynamicImport',
  'importMeta',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'asyncGenerators',
  'logicalAssignment',
  'numericSeparator',
  'optionalCatchBinding',
];

/**
 * Parse a source file into a Babel AST.
 * Returns a result object with either an AST or an error — never throws.
 *
 * @param {string} filePath - Absolute path to the file (used for error messages)
 * @param {string} source - Raw source code content
 * @returns {{ ast: import('@babel/parser').ParseResult<import('@babel/types').File>|null, error: Error|null }}
 */
function parseFile(filePath, source) {
  try {
    const ast = parse(source, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowUndeclaredExports: true,
      errorRecovery: true,   // Continue parsing even on syntax errors
      plugins: BASE_PLUGINS,
    });

    return { ast, error: null };
  } catch (err) {
    return {
      ast: null,
      error: new Error(`Parse error in ${filePath}: ${err.message}`),
    };
  }
}

module.exports = { parseFile };
