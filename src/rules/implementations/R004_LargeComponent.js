/**
 * @file rules/implementations/R004_LargeComponent.js
 */

'use strict';

const { AbstractRule } = require('../base/AbstractRule');
const { ComponentDetector } = require('../../parser/ComponentDetector');

class R004_LargeComponent extends AbstractRule {
  constructor() {
    super({
      id: 'R004',
      name: 'Large Component',
      description: 'Warns when a component exceeds a configurable line count limit.',
      severity: 'info',
      category: 'architecture',
    });
  }

  detect(context) {
    const violations = [];
    const maxLines = context.config.maxComponentLines || 300;
    const components = ComponentDetector.extract(context.ast);

    for (const comp of components) {
      const lineCount = comp.endLine - comp.startLine + 1;
      
      if (lineCount > maxLines) {
        violations.push(
          this.createViolation({
            filePath: context.filePath,
            line: comp.startLine,
            column: 0,
            message: `Component "${comp.name}" is ${lineCount} lines long, exceeding the limit of ${maxLines}.`,
            suggestion: 'Consider breaking this component down into smaller, focused sub-components.',
            componentName: comp.name,
          })
        );
      }
    }

    return violations;
  }
}

module.exports = { R004_LargeComponent };
