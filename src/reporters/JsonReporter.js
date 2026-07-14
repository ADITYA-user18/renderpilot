/**
 * @file reporters/JsonReporter.js
 * @description
 * Generates a machine-readable JSON report of the analysis.
 */

'use strict';

const fs = require('fs');
const path = require('path');

class JsonReporter {
  /**
   * Write the scan results to a JSON file.
   * @param {import('../types').ReportData} reportData
   */
  static generate(reportData) {
    const outputDir = path.resolve(process.cwd(), reportData.config.outputDir);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'renderpilot-report.json');
    
    // Create a clean JSON structure
    const jsonOutput = {
      version: reportData.version,
      scan: {
        root: reportData.scan.scanRoot,
        startedAt: reportData.scan.startedAt,
        completedAt: reportData.scan.completedAt,
        durationMs: reportData.scan.durationMs,
        stats: {
          totalFiles: reportData.scan.totalFiles,
          totalViolations: reportData.scan.totalViolations,
          parseErrors: reportData.scan.parseErrors,
          violationsBySeverity: reportData.scan.violationsBySeverity,
          violationsByCategory: reportData.scan.violationsByCategory,
        }
      },
      score: reportData.score,
      violations: reportData.scan.allViolations
    };

    fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
    
    return outputPath;
  }
}

module.exports = { JsonReporter };
