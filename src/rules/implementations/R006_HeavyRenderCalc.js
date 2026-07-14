/**
 * @file rules/implementations/R006_HeavyRenderCalc.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { getCodeSnippet, isArrayMethod } = require('../../parser/ASTUtils');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

class R006_HeavyRenderCalc extends AbstractRule {
  constructor() {
    super({
      id: 'R006',
      name: 'Heavy Calculations Inside Render',
      description: 'Detects heavy array operations (filter, map, reduce, sort) occurring directly inside the render path, which blocks painting.',
      severity: 'warning',
      category: 'rendering',
    });
  }

  detect(context) {
    const violations = [];
    const heavyMethods = ['filter', 'reduce', 'sort', 'find'];
    const { ComponentDetector } = require('../../parser/ComponentDetector');
    const components = ComponentDetector.extract(context.ast);

    traverse(context.ast, {
      CallExpression: (path) => {
        if (isArrayMethod(path.node, heavyMethods)) {
          const line = path.node.loc ? path.node.loc.start.line : 0;
          
          // Only proceed if this call is inside an actual React component
          const enclosingComponent = components.find(c => line >= c.startLine && line <= c.endLine);
          
          if (enclosingComponent) {
            let isInHook = false;
            
            let current = path.parentPath;
            while (current && current.node !== enclosingComponent.path.node) {
               // Check if we hit a hook boundary before hitting the component root
               if (t.isCallExpression(current.node) && 
                  (t.isIdentifier(current.node.callee, {name: 'useEffect'}) || 
                   t.isIdentifier(current.node.callee, {name: 'useCallback'}) ||
                   t.isIdentifier(current.node.callee, {name: 'useMemo'}))) {
                   isInHook = true;
                   break;
               }
               current = current.parentPath;
            }

            if (!isInHook) {
               const methodName = path.node.callee.property.name;
               let message, suggestion;
               
               if (methodName === 'sort') {
                 message = `Potential expensive calculation (.sort()). Array.sort() mutates the original array.`;
                 suggestion = `Use [...data].sort(...) to avoid mutating state, and consider useMemo if the array is large.`;
               } else {
                 message = `Potential expensive calculation (.${methodName}()) inside render.`;
                 suggestion = `If this computation is costly or the array is large, consider useMemo.`;
               }

               violations.push(
                this.createViolation({
                  filePath: context.filePath,
                  line: path.node.loc ? path.node.loc.start.line : 0,
                  column: path.node.loc ? path.node.loc.start.column : 0,
                  message,
                  suggestion,
                  codeSnippet: getCodeSnippet(context.lines, path.node.loc ? path.node.loc.start.line : 0),
                  componentName: enclosingComponent.name,
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

module.exports = { R006_HeavyRenderCalc };
