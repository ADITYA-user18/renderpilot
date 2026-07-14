/**
 * @file rules/registry/RuleRegistry.js
 * @description
 * Manages the registration and lifecycle of all analysis rules.
 * Provides lookup capabilities and handles enable/disable filtering.
 */

'use strict';

class RuleRegistry {
  constructor() {
    /** @type {Map<string, import('../../base/AbstractRule').AbstractRule>} */
    this.rules = new Map();
  }

  /**
   * Register a new rule instance.
   * @param {import('../../base/AbstractRule').AbstractRule} ruleInstance
   */
  register(ruleInstance) {
    if (this.rules.has(ruleInstance.id)) {
      throw new Error(`Rule with ID ${ruleInstance.id} is already registered.`);
    }
    this.rules.set(ruleInstance.id, ruleInstance);
  }

  /**
   * Get all registered rules.
   * @returns {import('../../base/AbstractRule').AbstractRule[]}
   */
  getAllRules() {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules that should be active for a given configuration.
   * Handles enable-lists and disable-lists.
   * @param {import('../../../types').ResolvedConfig} config
   * @returns {import('../../base/AbstractRule').AbstractRule[]}
   */
  getActiveRules(config) {
    return this.getAllRules().filter((rule) => {
      // If rule is explicitly disabled, skip it
      if (config.disabledRules.has(rule.id)) {
        return false;
      }
      // If an allowlist is provided, only include rules in the allowlist
      if (config.enabledRules !== null && !config.enabledRules.has(rule.id)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get a specific rule by ID.
   * @param {string} id
   * @returns {import('../../base/AbstractRule').AbstractRule | undefined}
   */
  getRule(id) {
    return this.rules.get(id);
  }
}

// Export a singleton instance
const ruleRegistry = new RuleRegistry();
module.exports = { ruleRegistry, RuleRegistry };
