/**
 * @file rules/implementations/R001_MissingKeyProp.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { getCodeSnippet } = require('../../parser/ASTUtils');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

class R001_MissingKeyProp extends AbstractRule {
  constructor() {
    super({
      id: 'R001',
      name: 'Missing Key Prop in Iterator',
      description: 'Detects JSX elements returned from array iterations (like map) that are missing a "key" prop.',
      severity: 'warning',
      category: 'rendering',
    });
  }

  detect(context) {
    const violations = [];

    traverse(context.ast, {
      CallExpression: (path) => {
        const callee = path.node.callee;
        
        // Check for .map()
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property, { name: 'map' })
        ) {
          const callback = path.node.arguments[0];
          
          if (
            t.isArrowFunctionExpression(callback) ||
            t.isFunctionExpression(callback)
          ) {
            let jsxElement = null;

            if (t.isJSXElement(callback.body) || t.isJSXFragment(callback.body)) {
              // Implicit return: .map(() => <div />)
              jsxElement = callback.body;
            } else if (t.isBlockStatement(callback.body)) {
              // Explicit return: .map(() => { return <div />; })
              const returnStmt = callback.body.body.find(stmt => t.isReturnStatement(stmt));
              if (returnStmt && (t.isJSXElement(returnStmt.argument) || t.isJSXFragment(returnStmt.argument))) {
                jsxElement = returnStmt.argument;
              }
            }

            if (jsxElement) {
              if (t.isJSXFragment(jsxElement)) {
                // Fragments must use shorthand syntax or explicitly <React.Fragment key={...}>
                // A bare <>...</> cannot have keys.
                violations.push(
                  this.createViolation({
                    filePath: context.filePath,
                    line: jsxElement.loc ? jsxElement.loc.start.line : 0,
                    column: jsxElement.loc ? jsxElement.loc.start.column : 0,
                    message: 'Missing "key" prop. Fragments returned from map() must use <React.Fragment key={...}> instead of <>...</>.',
                    suggestion: 'Change <> to <React.Fragment key={uniqueId}>.',
                    codeSnippet: getCodeSnippet(context.lines, jsxElement.loc ? jsxElement.loc.start.line : 0),
                  })
                );
              } else if (t.isJSXElement(jsxElement)) {
                // Check if 'key' exists
                const hasKey = jsxElement.openingElement.attributes.some(
                  attr => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: 'key' })
                );

                if (!hasKey) {
                   violations.push(
                    this.createViolation({
                      filePath: context.filePath,
                      line: jsxElement.loc ? jsxElement.loc.start.line : 0,
                      column: jsxElement.loc ? jsxElement.loc.start.column : 0,
                      message: 'Missing "key" prop on JSX element returned from array.map().',
                      suggestion: 'Add a unique "key" prop to the root element returned by the map callback.',
                      codeSnippet: getCodeSnippet(context.lines, jsxElement.loc ? jsxElement.loc.start.line : 0),
                    })
                  );
                }
              }
            }
          }
        }
      }
    });

    return violations;
  }
}

module.exports = { R001_MissingKeyProp };
