/**
 * @file scanner/ProjectScanner.js
 * @description
 * Orchestrates the full project scan: discovers files, parses them,
 * runs the rule engine, and collects the final results.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { FileScanner } = require('./FileScanner');
const { parseFile } = require('../parser/BabelParser');
const { RuleEngine } = require('../rules/engine/RuleEngine');
const { ComponentDetector } = require('../parser/ComponentDetector');

class ProjectScanner {
  /**
   * Run a full project scan.
   * @param {string} rootDir
   * @param {import('../types').ResolvedConfig} config
   * @returns {Promise<import('../types').ScanResult>}
   */
  static async scan(rootDir, config) {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    const filePaths = await FileScanner.discoverFiles(rootDir, config);
    
    /** @type {import('../types').FileAnalysisResult[]} */
    const files = [];
    
    const allViolations = [];
    let parseErrors = 0;

    for (const filePath of filePaths) {
      const fileStartTime = Date.now();
      const relativePath = path.relative(rootDir, filePath);
      const source = fs.readFileSync(filePath, 'utf-8');
      const lines = source.split(/\r?\n/);

      const { ast, error } = parseFile(filePath, source);

      if (error || !ast) {
        parseErrors++;
        files.push({
          filePath,
          relativePath,
          violations: [],
          analysisDurationMs: Date.now() - fileStartTime,
          parsed: false,
          parseError: error ? error.message : 'Unknown parse error',
          lineCount: lines.length,
          componentNames: [],
        });
        continue;
      }

      // We only care about files that actually have components for some rules,
      // but we run all rules and let them decide. We extract component names just for the report.
      const components = ComponentDetector.extract(ast);
      const componentNames = components.map(c => c.name);

      const context = {
        ast,
        filePath,
        fileContent: source,
        lines,
        config,
      };

      const violations = RuleEngine.run(context);
      allViolations.push(...violations);

      files.push({
        filePath,
        relativePath,
        violations,
        analysisDurationMs: Date.now() - fileStartTime,
        parsed: true,
        lineCount: lines.length,
        componentNames,
      });
    }

    const durationMs = Date.now() - startTime;

    // Aggregate stats
    const violationsBySeverity = { critical: 0, warning: 0, info: 0 };
    const violationsByCategory = { rendering: 0, hooks: 0, architecture: 0, maintainability: 0 };
    const violationsByRule = {};

    for (const v of allViolations) {
      violationsBySeverity[v.severity] = (violationsBySeverity[v.severity] || 0) + 1;
      violationsByCategory[v.category] = (violationsByCategory[v.category] || 0) + 1;
      violationsByRule[v.ruleId] = (violationsByRule[v.ruleId] || 0) + 1;
    }

    return {
      scanRoot: rootDir,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs,
      files,
      totalFiles: filePaths.length,
      parseErrors,
      allViolations,
      totalViolations: allViolations.length,
      violationsBySeverity,
      violationsByCategory,
      violationsByRule,
    };
  }
}

module.exports = { ProjectScanner };
