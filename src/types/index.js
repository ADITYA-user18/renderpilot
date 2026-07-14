/**
 * @file types/index.js
 * @description
 * Central JSDoc type definitions for RenderPilot.
 * All types used across the project are documented here.
 * This file is never executed — it exists purely for editor
 * IntelliSense and JSDoc annotation purposes.
 */

'use strict';

// ─── Enumerations (as JSDoc unions) ──────────────────────────────────────────

/**
 * Severity levels for rule violations.
 * @typedef {'critical' | 'warning' | 'info'} Severity
 */

/**
 * Performance analysis categories.
 * @typedef {'rendering' | 'hooks' | 'architecture' | 'maintainability'} Category
 */

/**
 * Impact level of a single violation.
 * @typedef {'low' | 'medium' | 'high' | 'critical'} ImpactLevel
 */

/**
 * Letter grade for a performance score.
 * @typedef {'A' | 'B' | 'C' | 'D' | 'F'} Grade
 */

// ─── Impact Estimate ─────────────────────────────────────────────────────────

/**
 * Estimated performance impact of a rule violation.
 * @typedef {Object} ImpactEstimate
 * @property {ImpactLevel} level - Categorical impact level
 * @property {string} description - Human-readable impact description
 * @property {string} [estimatedFpsGain] - Optional FPS improvement estimate
 * @property {string} [estimatedRerenderReduction] - Optional rerender reduction estimate
 */

// ─── Rule Violation ───────────────────────────────────────────────────────────

/**
 * A single detected rule violation in a source file.
 * This is the primary output unit produced by every rule.
 * @typedef {Object} RuleViolation
 * @property {string} ruleId - Unique rule identifier (e.g. "R001")
 * @property {string} ruleName - Human-readable rule name
 * @property {Severity} severity - Violation severity
 * @property {Category} category - Performance category
 * @property {string} filePath - Absolute file path
 * @property {number} line - 1-indexed line number
 * @property {number} column - 0-indexed column number
 * @property {string} message - Human-readable violation message
 * @property {string} suggestion - Actionable fix suggestion
 * @property {ImpactEstimate} impact - Estimated performance impact
 * @property {string} [codeSnippet] - Snippet of the violating code
 * @property {string} [componentName] - Name of the component containing the violation
 */

// ─── Rule Context ─────────────────────────────────────────────────────────────

/**
 * Context object passed to every rule's detect() method.
 * @typedef {Object} RuleContext
 * @property {import('@babel/parser').ParseResult<import('@babel/types').File>} ast - Parsed Babel AST
 * @property {string} filePath - Absolute path of the file being analyzed
 * @property {string} fileContent - Raw source code of the file
 * @property {string[]} lines - Source split by newline
 * @property {ResolvedConfig} config - Resolved user configuration
 */

// ─── Config Types ─────────────────────────────────────────────────────────────

/**
 * Severity override map (ruleId → Severity)
 * @typedef {Object.<string, Severity>} SeverityOverride
 */

/**
 * User-facing configuration object (renderpilot.config.js)
 * @typedef {Object} UserConfig
 * @property {string[]} [ignoreDirs] - Extra directories to ignore
 * @property {number} [maxComponentLines] - Max component line count (default: 300)
 * @property {SeverityOverride} [severityOverrides] - Per-rule severity overrides
 * @property {string[]} [enabledRules] - Allowlist of rule IDs to run
 * @property {string[]} [disabledRules] - Rule IDs to skip
 * @property {string} [outputDir] - Output directory for reports (default: '.renderpilot')
 */

/**
 * Fully resolved configuration used internally (defaults merged with user config)
 * @typedef {Object} ResolvedConfig
 * @property {string[]} ignoreDirs - Directories to skip during file scanning
 * @property {number} maxComponentLines - Maximum component lines threshold
 * @property {SeverityOverride} severityOverrides - Effective severity per rule
 * @property {Set<string>|null} enabledRules - Enabled rule IDs (null = all enabled)
 * @property {Set<string>} disabledRules - Disabled rule IDs
 * @property {string} outputDir - Report output directory
 * @property {boolean} hasCustomConfig - Whether a custom config file was found
 */

// ─── Scan Types ───────────────────────────────────────────────────────────────

/**
 * Analysis result for a single source file.
 * @typedef {Object} FileAnalysisResult
 * @property {string} filePath - Absolute file path
 * @property {string} relativePath - Relative file path from scan root
 * @property {RuleViolation[]} violations - All violations in this file
 * @property {number} analysisDurationMs - Time taken to analyze in ms
 * @property {boolean} parsed - Whether parsing succeeded
 * @property {string} [parseError] - Parse error message if failed
 * @property {number} lineCount - Number of lines in the file
 * @property {string[]} componentNames - Detected component names
 */

/**
 * Complete scan result across all files in the project.
 * @typedef {Object} ScanResult
 * @property {string} scanRoot - Root directory that was scanned
 * @property {string} startedAt - ISO 8601 scan start timestamp
 * @property {string} completedAt - ISO 8601 scan end timestamp
 * @property {number} durationMs - Total scan duration in ms
 * @property {FileAnalysisResult[]} files - All analyzed files
 * @property {number} totalFiles - Total number of files scanned
 * @property {number} parseErrors - Number of files that failed to parse
 * @property {RuleViolation[]} allViolations - All violations (flattened)
 * @property {number} totalViolations - Total violation count
 * @property {{critical:number, warning:number, info:number}} violationsBySeverity
 * @property {{rendering:number, hooks:number, architecture:number, maintainability:number}} violationsByCategory
 * @property {Object.<string, number>} violationsByRule - Violation counts per rule ID
 */

// ─── Score Types ──────────────────────────────────────────────────────────────

/**
 * Score for a single performance category.
 * @typedef {Object} CategoryScore
 * @property {Category} category - The category being scored
 * @property {number} score - Numeric score 0–100
 * @property {Grade} grade - Letter grade
 * @property {number} violations - Number of violations in this category
 * @property {number} penaltyApplied - Total penalty applied
 */

/**
 * Complete performance score for the scanned project.
 * @typedef {Object} PerformanceScore
 * @property {number} overall - Overall score 0–100
 * @property {Grade} grade - Overall letter grade
 * @property {string} label - Human-readable label (e.g., "Excellent")
 * @property {CategoryScore[]} categories - Scores per category
 * @property {number} totalPenalty - Total penalty applied to overall score
 * @property {{critical:number, warning:number, info:number}} penaltyBySeverity
 * @property {number} estimatedImprovementOnCriticalFix - Score gain if critical issues fixed
 * @property {number} estimatedImprovementOnAllFix - Score gain if all issues fixed
 * @property {string} topRecommendation - Top actionable recommendation
 */

// ─── Report Types ─────────────────────────────────────────────────────────────

/**
 * Full report data passed to all reporters.
 * @typedef {Object} ReportData
 * @property {ScanResult} scan - Scan results
 * @property {PerformanceScore} score - Performance score
 * @property {string} version - RenderPilot version used
 * @property {ResolvedConfig} config - Config that was used
 */

module.exports = {};
