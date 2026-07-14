/**
 * @file rules/implementations/R009_UnusedState.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { getCodeSnippet } = require('../../parser/ASTUtils');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

class R009_UnusedState extends AbstractRule {
  constructor() {
    super({
      id: 'R009',
      name: 'Unused React State',
      description: 'Detects useState variables that are never referenced.',
      severity: 'warning',
      category: 'maintainability',
    });
  }

  detect(context) {
    const violations = [];

    traverse(context.ast, {
      VariableDeclarator: (path) => {
        if (
          t.isCallExpression(path.node.init) &&
          (t.isIdentifier(path.node.init.callee, { name: 'useState' }) || 
           (t.isMemberExpression(path.node.init.callee) && t.isIdentifier(path.node.init.callee.property, { name: 'useState' }))) &&
          t.isArrayPattern(path.node.id) &&
          path.node.id.elements.length > 0
        ) {
          const stateVar = path.node.id.elements[0];
          
          if (t.isIdentifier(stateVar)) {
            const name = stateVar.name;
            const binding = path.scope.getBinding(name);
            
            if (binding && !binding.referenced) {
               violations.push(
                this.createViolation({
                  filePath: context.filePath,
                  line: path.node.loc ? path.node.loc.start.line : 0,
                  column: path.node.loc ? path.node.loc.start.column : 0,
                  message: `State variable "${name}" is never used.`,
                  suggestion: 'Remove unused state to improve maintainability and avoid confusion.',
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

module.exports = { R009_UnusedState };
