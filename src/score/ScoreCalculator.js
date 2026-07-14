/**
 * @file score/ScoreCalculator.js
 * @description
 * Calculates the overall performance score and aggregates category scores.
 */

'use strict';

const { CategoryScorer } = require('./CategoryScorer');
const { SEVERITY_PENALTY, CATEGORY_WEIGHT } = require('./ScoreWeights');

class ScoreCalculator {
  /**
   * Get human-readable label for a score.
   * @param {number} score
   * @returns {string}
   */
  static getLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Needs Work';
    if (score >= 40) return 'Poor';
    return 'Critical';
  }

  /**
   * Get top recommendation based on violations.
   * @param {import('../types').RuleViolation[]} violations
   * @returns {string}
   */
  static getTopRecommendation(violations) {
    if (violations.length === 0) return 'Keep up the great work!';
    
    const critical = violations.filter(v => v.severity === 'critical');
    if (critical.length > 0) {
      return `Fix ${critical.length} critical issues immediately to prevent infinite loops and broken UI.`;
    }

    const rendering = violations.filter(v => v.category === 'rendering' && v.severity === 'warning');
    if (rendering.length > 0) {
       return `Focus on reducing unnecessary rerenders by fixing keys and memoizing heavy calculations.`;
    }

    return 'Review the warnings to further optimize component performance.';
  }

  /**
   * Compute the full performance score.
   * @param {import('../types').RuleViolation[]} violations
   * @returns {import('../types').PerformanceScore}
   */
  static compute(violations) {
    let totalPenalty = 0;
    let criticalPenalty = 0;
    
    const penaltyBySeverity = { critical: 0, warning: 0, info: 0 };
    
    for (const v of violations) {
      const base = SEVERITY_PENALTY[v.severity] || 0;
      const weight = CATEGORY_WEIGHT[v.category] || 1;
      const penalty = base * weight;
      
      totalPenalty += penalty;
      penaltyBySeverity[v.severity] += penalty;
      
      if (v.severity === 'critical') {
        criticalPenalty += penalty;
      }
    }

    const overallScore = Math.max(0, Math.round(100 - totalPenalty));
    
    const categories = [
      CategoryScorer.scoreCategory('rendering', violations),
      CategoryScorer.scoreCategory('hooks', violations),
      CategoryScorer.scoreCategory('architecture', violations),
      CategoryScorer.scoreCategory('maintainability', violations),
    ];

    const estimatedImprovementOnCriticalFix = Math.min(100 - overallScore, Math.round(criticalPenalty));
    const estimatedImprovementOnAllFix = Math.min(100 - overallScore, Math.round(totalPenalty));

    return {
      overall: overallScore,
      grade: CategoryScorer.getGrade(overallScore),
      label: this.getLabel(overallScore),
      categories,
      totalPenalty,
      penaltyBySeverity,
      estimatedImprovementOnCriticalFix,
      estimatedImprovementOnAllFix,
      topRecommendation: this.getTopRecommendation(violations),
    };
  }
}

module.exports = { ScoreCalculator };
