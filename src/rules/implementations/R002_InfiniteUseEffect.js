/**
 * @file rules/implementations/R002_InfiniteUseEffect.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { getCodeSnippet, isHookCall, getDepsArray } = require('../../parser/ASTUtils');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

class R002_InfiniteUseEffect extends AbstractRule {
  constructor() {
    super({
      id: 'R002',
      name: 'Infinite useEffect Loop',
      description: 'Detects useEffect hooks without a dependency array that contain state updates, which causes infinite rerenders.',
      severity: 'critical',
      category: 'hooks',
    });
  }

  detect(context) {
    const violations = [];

    // Step 1: Find all state setters in the file so we know what they look like
    const stateSetters = new Set();
    traverse(context.ast, {
      VariableDeclarator(path) {
        if (
          t.isCallExpression(path.node.init) &&
          (t.isIdentifier(path.node.init.callee, { name: 'useState' }) || 
           (t.isMemberExpression(path.node.init.callee) && t.isIdentifier(path.node.init.callee.property, { name: 'useState' }))) &&
          t.isArrayPattern(path.node.id) &&
          path.node.id.elements.length === 2 &&
          t.isIdentifier(path.node.id.elements[1])
        ) {
          stateSetters.add(path.node.id.elements[1].name);
        }
      }
    });

    // Step 2: Check useEffects
    traverse(context.ast, {
      CallExpression: (path) => {
        if (isHookCall(path.node, 'useEffect')) {
          const deps = getDepsArray(path.node);
          
          // If there is NO dependency array (not even an empty one)
          if (!deps) {
            const callback = path.node.arguments[0];
            let callsStateSetter = false;

            if (callback && (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback))) {
              traverse(callback, {
                CallExpression(innerPath) {
                  if (t.isIdentifier(innerPath.node.callee) && stateSetters.has(innerPath.node.callee.name)) {
                    callsStateSetter = true;
                    innerPath.stop();
                  }
                }
              }, path.scope, null, path);
            }

            if (callsStateSetter) {
               violations.push(
                this.createViolation({
                  filePath: context.filePath,
                  line: path.node.loc ? path.node.loc.start.line : 0,
                  column: path.node.loc ? path.node.loc.start.column : 0,
                  message: 'useEffect without a dependency array calls a state setter. This will cause an infinite render loop.',
                  suggestion: 'Add a dependency array [] to run only on mount, or include specific dependencies.',
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

module.exports = { R002_InfiniteUseEffect };
