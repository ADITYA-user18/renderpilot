/**
 * @file rules/implementations/R003_IncorrectDepsArray.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { getCodeSnippet, isHookCall, getDepsArray, collectIdentifiers, extractDepArrayNames } = require('../../parser/ASTUtils');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

class R003_IncorrectDepsArray extends AbstractRule {
  constructor() {
    super({
      id: 'R003',
      name: 'Incorrect Dependency Array',
      description: 'Detects variables referenced inside useEffect/useCallback/useMemo that are missing from the dependency array.',
      severity: 'warning',
      category: 'hooks',
    });
  }

  detect(context) {
    const violations = [];
    const hooksToCheck = ['useEffect', 'useCallback', 'useMemo'];

    traverse(context.ast, {
      CallExpression: (path) => {
        const hookName = hooksToCheck.find(h => isHookCall(path.node, h));
        if (hookName) {
          const depsArray = getDepsArray(path.node);
          
          if (depsArray) {
            const callback = path.node.arguments[0];
            if (callback && (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback))) {
              
              // 1. Get all variables referenced inside the callback
              const referencedIds = new Set();
              
              // Walk the callback body and collect variables that are NOT declared locally
              path.get('arguments.0').traverse({
                Identifier(innerPath) {
                  // Ignore object properties
                  if (t.isMemberExpression(innerPath.parent) && innerPath.parent.property === innerPath.node && !innerPath.parent.computed) return;
                  
                  // Must be a reference, not a declaration
                  if (innerPath.isReferencedIdentifier()) {
                    const name = innerPath.node.name;
                    
                    // Is it bound in the scope outside the hook, but inside the component?
                    const binding = innerPath.scope.getBinding(name);
                    
                    // We only care about variables bound in the outer scope (e.g. component scope)
                    // If binding is null, it's a global (like window).
                    // If binding exists but it's bound at the file root (module scope), it's static, ignore.
                    if (binding && binding.scope !== path.scope.getProgramParent()) {
                      // Also ensure it's not bound *inside* the callback itself
                      const callbackScope = path.get('arguments.0').scope;
                      let isLocal = false;
                      let currentScope = binding.scope;
                      while(currentScope) {
                        if (currentScope === callbackScope) {
                          isLocal = true;
                          break;
                        }
                        currentScope = currentScope.parent;
                      }
                      
                      if (!isLocal) {
                        referencedIds.add(name);
                      }
                    }
                  }
                }
              });

              // 2. Get dependencies explicitly listed
              const listedDeps = extractDepArrayNames(depsArray);

              // 3. Find missing dependencies
              const missing = [];
              for (const ref of referencedIds) {
                if (!listedDeps.has(ref) && ref !== 'dispatch' && ref !== 'set' + ref.substring(3)) {
                   // Crude heuristic to ignore some setX functions, standard linter does this better with flow analysis
                   // but this works for 90% of cases
                   missing.push(ref);
                }
              }

              if (missing.length > 0) {
                violations.push(
                  this.createViolation({
                    filePath: context.filePath,
                    line: depsArray.loc ? depsArray.loc.start.line : 0,
                    column: depsArray.loc ? depsArray.loc.start.column : 0,
                    message: `${hookName} has missing dependencies: ${missing.join(', ')}.`,
                    suggestion: `Include [${missing.join(', ')}] in the dependency array.`,
                    codeSnippet: getCodeSnippet(context.lines, depsArray.loc ? depsArray.loc.start.line : 0),
                  })
                );
              }
            }
          }
        }
      }
    });

    return violations;
  }
}

module.exports = { R003_IncorrectDepsArray };
