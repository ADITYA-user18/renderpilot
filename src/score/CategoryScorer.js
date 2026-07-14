/**
 * @file score/CategoryScorer.js
 * @description
 * Calculates the score for an individual category.
 */

'use strict';

const { SEVERITY_PENALTY, CATEGORY_WEIGHT } = require('./ScoreWeights');

class CategoryScorer {
  /**
   * Calculate a grade based on a numeric score.
   * @param {number} score
   * @returns {import('../types').Grade}
   */
  static getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Calculate the score for a specific category.
   * @param {import('../types').Category} category
   * @param {import('../types').RuleViolation[]} violations
   * @returns {import('../types').CategoryScore}
   */
  static scoreCategory(category, violations) {
    const categoryViolations = violations.filter(v => v.category === category);
    
    let penalty = 0;
    for (const v of categoryViolations) {
      const base = SEVERITY_PENALTY[v.severity] || 0;
      const weight = CATEGORY_WEIGHT[category] || 1;
      penalty += (base * weight);
    }

    const score = Math.max(0, Math.round(100 - penalty));

    return {
      category,
      score,
      grade: this.getGrade(score),
      violations: categoryViolations.length,
      penaltyApplied: penalty,
    };
  }
}

module.exports = { CategoryScorer };
