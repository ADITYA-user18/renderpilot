/**
 * @file rules/engine/RuleEngine.js
 * @description
 * The core execution engine. Takes an AST and configuration,
 * runs all active rules against it, and aggregates the violations.
 */

'use strict';

const { ruleRegistry } = require('../registry/RuleRegistry');
const { getComponentName, isReactComponent } = require('../../parser/ASTUtils');
const traverse = require('@babel/traverse').default;

class RuleEngine {
  /**
   * Run all active rules on a given file.
   *
   * @param {import('../../types').RuleContext} context
   * @returns {import('../../types').RuleViolation[]}
   */
  static run(context) {
    if (!context.ast) return [];

    const activeRules = ruleRegistry.getActiveRules(context.config);
    if (activeRules.length === 0) return [];

    let violations = [];

    // Pre-process: Find components to enrich the context if needed, 
    // but the actual detection is up to each rule.
    // We pass the context directly to rules. Rules can traverse the AST themselves.
    
    // Note: Some rules might benefit from a shared traversal, but to keep the 
    // architecture truly modular and decoupled, we let each rule run its own detect().
    // Babel AST traversal is fast enough for our use cases, but if performance 
    // becomes an issue on massive codebases, we could transition to a visitor pattern 
    // where rules register visitors and the engine does a single pass.
    
    // For now, each rule is self-contained.
    for (const rule of activeRules) {
      try {
        const ruleViolations = rule.detect(context);
        
        // Apply severity overrides if any
        const override = context.config.severityOverrides[rule.id];
        if (override) {
          ruleViolations.forEach(v => {
            v.severity = override;
            // Re-evaluate impact if severity changed
            v.impact = rule.estimatedImpact({ ...v, severity: override });
          });
        }
        
        violations.push(...ruleViolations);
      } catch (err) {
        console.error(`[RenderPilot] Error running rule ${rule.id} on ${context.filePath}:`, err);
      }
    }

    // Sort violations by line number
    violations.sort((a, b) => a.line - b.line);

    return violations;
  }
}

module.exports = { RuleEngine };
