/**
 * @file rules/implementations/R007_MemoCandidate.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { ComponentDetector } = require('../../parser/ComponentDetector');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

class R007_MemoCandidate extends AbstractRule {
  constructor() {
    super({
      id: 'R007',
      name: 'React.memo Candidate',
      description: 'Detects pure components (no state, no effects, only props) that might benefit from React.memo.',
      severity: 'info',
      category: 'rendering',
    });
  }

  detect(context) {
    const violations = [];
    const components = ComponentDetector.extract(context.ast);

    for (const comp of components) {
      let hasHooks = false;
      
      // Traverse inside the component to look for hooks
      comp.path.traverse({
        CallExpression(innerPath) {
          if (t.isIdentifier(innerPath.node.callee)) {
            if (innerPath.node.callee.name.startsWith('use')) {
              hasHooks = true;
              innerPath.stop();
            }
          } else if (t.isMemberExpression(innerPath.node.callee) && t.isIdentifier(innerPath.node.callee.property)) {
             if (innerPath.node.callee.property.name.startsWith('use')) {
               hasHooks = true;
               innerPath.stop();
             }
          }
        }
      });

      if (!hasHooks) {
        // Pure component!
        // Does it use React.memo already? We can check the parent of the component node.
        let isMemoized = false;
        const parentNode = comp.path.parent;
        
        if (t.isCallExpression(parentNode) && t.isIdentifier(parentNode.callee, {name: 'memo'})) {
           isMemoized = true;
        } else if (t.isCallExpression(parentNode) && t.isMemberExpression(parentNode.callee) && t.isIdentifier(parentNode.callee.property, {name: 'memo'})) {
           isMemoized = true;
        } else if (t.isVariableDeclarator(parentNode) && t.isCallExpression(parentNode.init) && 
                  (t.isIdentifier(parentNode.init.callee, {name: 'memo'}) || 
                   (t.isMemberExpression(parentNode.init.callee) && t.isIdentifier(parentNode.init.callee.property, {name: 'memo'})))) {
           isMemoized = true;
        }

        if (!isMemoized) {
          // Check if the component actually accepts props
          const hasProps = comp.path.node.params && comp.path.node.params.length > 0;
          
          if (hasProps) {
            violations.push(
              this.createViolation({
                filePath: context.filePath,
                line: comp.startLine,
                column: 0,
                message: `This component appears to be pure and receives props.`,
                suggestion: `React.memo may reduce unnecessary re-renders if parent renders frequently.`,
                componentName: comp.name,
              })
            );
          }
        }
      }
    }

    return violations;
  }
}

module.exports = { R007_MemoCandidate };
