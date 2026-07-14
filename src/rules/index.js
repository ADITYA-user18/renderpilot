/**
 * @file rules/index.js
 * @description
 * Bootstraps the Rule Registry by loading and registering all built-in rules.
 */

'use strict';

const { ruleRegistry } = require('./registry/RuleRegistry');
const { RuleEngine } = require('./engine/RuleEngine');

// Import all rules
const { R001_MissingKeyProp } = require('./implementations/R001_MissingKeyProp');
const { R002_InfiniteUseEffect } = require('./implementations/R002_InfiniteUseEffect');
const { R003_IncorrectDepsArray } = require('./implementations/R003_IncorrectDepsArray');
const { R004_LargeComponent } = require('./implementations/R004_LargeComponent');
const { R005_InlineCallback } = require('./implementations/R005_InlineCallback');
const { R006_HeavyRenderCalc } = require('./implementations/R006_HeavyRenderCalc');
const { R007_MemoCandidate } = require('./implementations/R007_MemoCandidate');
const { R008_NestedComponent } = require('./implementations/R008_NestedComponent');
const { R009_UnusedState } = require('./implementations/R009_UnusedState');

// Register them
ruleRegistry.register(new R001_MissingKeyProp());
ruleRegistry.register(new R002_InfiniteUseEffect());
ruleRegistry.register(new R003_IncorrectDepsArray());
ruleRegistry.register(new R004_LargeComponent());
ruleRegistry.register(new R005_InlineCallback());
ruleRegistry.register(new R006_HeavyRenderCalc());
ruleRegistry.register(new R007_MemoCandidate());
ruleRegistry.register(new R008_NestedComponent());
ruleRegistry.register(new R009_UnusedState());

module.exports = {
  ruleRegistry,
  RuleEngine,
};
