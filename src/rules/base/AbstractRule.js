/**
 * @file rules/base/AbstractRule.js
 * @description
 * Abstract base class for all RenderPilot rules.
 * Every rule extends this and implements the detect() method.
 *
 * Design principle: detect() is the only required override.
 * fixSuggestion() and estimatedImpact() have sensible defaults
 * that rules can override for more specific guidance.
 */

'use strict';

/**
 * Abstract base class for a RenderPilot analysis rule.
 * @abstract
 */
class AbstractRule {
  /**
   * @param {object} options - Rule metadata
   * @param {string} options.id - Unique rule ID (e.g. "R001")
   * @param {string} options.name - Human-readable rule name
   * @param {string} options.description - What this rule detects
   * @param {import('../../types').Severity} options.severity - Default severity
   * @param {import('../../types').Category} options.category - Performance category
   * @param {string} [options.docsUrl] - Documentation URL
   */
  constructor({ id, name, description, severity, category, docsUrl }) {
    if (new.target === AbstractRule) {
      throw new Error('AbstractRule cannot be instantiated directly.');
    }

    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.name = name;
    /** @type {string} */
    this.description = description;
    /** @type {import('../../types').Severity} */
    this.severity = severity;
    /** @type {import('../../types').Category} */
    this.category = category;
    /** @type {string} */
    this.docsUrl = docsUrl || `https://renderpilot.dev/rules/${id.toLowerCase()}`;
  }

  /**
   * Detect violations in the given rule context.
   * Subclasses MUST implement this method.
   *
   * @abstract
   * @param {import('../../types').RuleContext} context
   * @returns {import('../../types').RuleViolation[]}
   */
  // eslint-disable-next-line no-unused-vars
  detect(_context) {
    throw new Error(`Rule ${this.id} must implement detect()`);
  }

  /**
   * Generate a fix suggestion for a violation.
   * Override for rule-specific guidance.
   *
   * @param {import('../../types').RuleViolation} _violation
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  fixSuggestion(_violation) {
    return 'Review the flagged code and apply performance best practices.';
  }

  /**
   * Estimate the performance impact of a violation.
   * Override to provide rule-specific estimates.
   *
   * @param {import('../../types').RuleViolation} _violation
   * @returns {import('../../types').ImpactEstimate}
   */
  // eslint-disable-next-line no-unused-vars
  estimatedImpact(_violation) {
    const levelMap = {
      critical: 'critical',
      warning: 'medium',
      info: 'low',
    };
    return {
      level: levelMap[this.severity] || 'low',
      description: 'Performance impact varies. Address to improve render efficiency.',
    };
  }

  /**
   * Helper: create a RuleViolation object.
   * Rules call this instead of constructing raw objects.
   *
   * @param {object} options
   * @param {string} options.filePath
   * @param {number} options.line
   * @param {number} options.column
   * @param {string} options.message
   * @param {string} options.suggestion
   * @param {string} [options.codeSnippet]
   * @param {string} [options.componentName]
   * @param {import('../../types').Severity} [options.severity] - Override default severity
   * @returns {import('../../types').RuleViolation}
   */
  createViolation({
    filePath,
    line,
    column,
    message,
    suggestion,
    codeSnippet,
    componentName,
    severity,
  }) {
    const effectiveSeverity = severity || this.severity;
    const violation = {
      ruleId: this.id,
      ruleName: this.name,
      severity: effectiveSeverity,
      category: this.category,
      filePath,
      line,
      column: column || 0,
      message,
      suggestion,
      impact: this.estimatedImpact({ ruleId: this.id, severity: effectiveSeverity }),
      codeSnippet,
      componentName,
    };
    return violation;
  }
}

module.exports = { AbstractRule };
