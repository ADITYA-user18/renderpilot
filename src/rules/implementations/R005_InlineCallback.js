/**
 * @file rules/implementations/R005_InlineCallback.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { getCodeSnippet } = require('../../parser/ASTUtils');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

class R005_InlineCallback extends AbstractRule {
  constructor() {
    super({
      id: 'R005',
      name: 'Inline Callback Detection',
      description: 'Detects inline arrow functions passed to DOM events or components, which cause unnecessary recreations.',
      severity: 'info',
      category: 'rendering',
    });
  }

  detect(context) {
    const violations = [];

    traverse(context.ast, {
      JSXAttribute: (path) => {
        const attrName = path.node.name.name;
        
        // Target common event handlers like onClick, onChange, onSubmit
        if (typeof attrName === 'string' && attrName.startsWith('on') && attrName[2] === attrName[2]?.toUpperCase()) {
          const value = path.node.value;
          
          if (t.isJSXExpressionContainer(value)) {
            const expr = value.expression;
            
            if (t.isArrowFunctionExpression(expr) || t.isFunctionExpression(expr)) {
               violations.push(
                this.createViolation({
                  filePath: context.filePath,
                  line: path.node.loc ? path.node.loc.start.line : 0,
                  column: path.node.loc ? path.node.loc.start.column : 0,
                  message: `Inline callback detected on ${attrName}. This creates a new function on every render.`,
                  suggestion: 'Consider useCallback if passing it to memoized children or if profiling indicates a performance issue.',
                  codeSnippet: getCodeSnippet(context.lines, path.node.loc ? path.node.loc.start.line : 0),
                })
              );
            }
          }
        }
      }
    });

    return violations;
  }
}

module.exports = { R005_InlineCallback };
