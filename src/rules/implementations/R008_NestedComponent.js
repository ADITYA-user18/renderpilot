/**
 * @file rules/implementations/R008_NestedComponent.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { ComponentDetector } = require('../../parser/ComponentDetector');
const { getCodeSnippet } = require('../../parser/ASTUtils');
const t = require('@babel/types');

class R008_NestedComponent extends AbstractRule {
  constructor() {
    super({
      id: 'R008',
      name: 'Nested Component Declarations',
      description: 'Detects components defined inside other components, which forces unmount/remount on every render.',
      severity: 'critical',
      category: 'architecture',
    });
  }

  detect(context) {
    const violations = [];
    const components = ComponentDetector.extract(context.ast);

    // Build a map of components by their path for easy lookup
    const compPaths = new Set(components.map(c => c.path));

    for (const comp of components) {
      // Find components whose parent path is ALSO a component
      let current = comp.path.parentPath;
      let isNested = false;
      let parentCompName = '';

      while (current) {
        if (compPaths.has(current)) {
           isNested = true;
           const parentComp = components.find(c => c.path === current);
           if (parentComp) parentCompName = parentComp.name;
           break;
        }
        current = current.parentPath;
      }

      if (isNested) {
        violations.push(
          this.createViolation({
            filePath: context.filePath,
            line: comp.startLine,
            column: 0,
            message: `Component "${comp.name}" is declared inside "${parentCompName}".`,
            suggestion: `Move "${comp.name}" outside of "${parentCompName}". Nested declarations cause React to destroy and recreate the DOM on every render.`,
            codeSnippet: getCodeSnippet(context.lines, comp.startLine),
            componentName: comp.name,
          })
        );
      }
    }

    return violations;
  }
}

module.exports = { R008_NestedComponent };
