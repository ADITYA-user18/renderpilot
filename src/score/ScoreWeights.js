/**
 * @file score/ScoreWeights.js
 * @description
 * Defines the constant weights and penalties for the scoring algorithm.
 */

'use strict';

/**
 * Base penalty applied per violation based on severity.
 * @type {Record<import('../types').Severity, number>}
 */
const SEVERITY_PENALTY = {
  critical: 15,
  warning: 5,
  info: 1,
};

/**
 * Multiplier applied to the penalty based on category.
 * @type {Record<import('../types').Category, number>}
 */
const CATEGORY_WEIGHT = {
  rendering: 1.5,
  hooks: 1.3,
  architecture: 1.0,
  maintainability: 0.7,
};

module.exports = {
  SEVERITY_PENALTY,
  CATEGORY_WEIGHT,
};
