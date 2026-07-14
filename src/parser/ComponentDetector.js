/**
 * @file parser/ComponentDetector.js
 * @description
 * Utility to identify all React component declarations within an AST.
 */

'use strict';

const traverse = require('@babel/traverse').default;
const { isReactComponent, getComponentName } = require('./ASTUtils');

/**
 * Represents a detected React component in a file.
 * @typedef {Object} ComponentInfo
 * @property {string} name - Component name
 * @property {number} startLine - 1-indexed start line
 * @property {number} endLine - 1-indexed end line
 * @property {import('@babel/traverse').NodePath} path - Babel AST path
 */

class ComponentDetector {
  /**
   * Extract all React components from an AST.
   * @param {import('@babel/parser').ParseResult<import('@babel/types').File>} ast
   * @returns {ComponentInfo[]}
   */
  static extract(ast) {
    const components = [];

    traverse(ast, {
      enter(path) {
        const node = path.node;
        const name = getComponentName(node, path);
        
        if (name && isReactComponent(node, name)) {
          // Additional heuristic: does it contain JSX? (optional, but good for filtering out plain utility functions with capitalized names)
          // For now, we trust the uppercase name convention.
          
          components.push({
            name,
            startLine: node.loc ? node.loc.start.line : 0,
            endLine: node.loc ? node.loc.end.line : 0,
            path
          });
        }
      }
    });

    return components;
  }
}

module.exports = { ComponentDetector };
