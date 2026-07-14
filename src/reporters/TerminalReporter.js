/**
 * @file reporters/TerminalReporter.js
 * @description
 * Formats and prints a beautiful CLI report using chalk.
 */

'use strict';

const chalk = require('chalk');
const path = require('path');

class TerminalReporter {
  /**
   * Print the terminal report.
   * @param {import('../types').ReportData} reportData
   */
  static generate({ scan, score }) {
    console.log('\n' + chalk.bold.cyan('✈ RenderPilot Analysis Report'));
    console.log(chalk.dim('=================================================='));

    if (scan.totalViolations === 0) {
      console.log(`\n🎉 ${chalk.green('No performance issues found!')}`);
      console.log(`Scanned ${scan.totalFiles} files in ${scan.durationMs}ms.\n`);
      return;
    }

    // Group violations by file for readable output
    const filesWithIssues = scan.files.filter(f => f.violations.length > 0);

    for (const file of filesWithIssues) {
      console.log(`\n📄 ${chalk.bold.underline(file.relativePath)}`);
      
      for (const v of file.violations) {
        const severityColor = this.getSeverityColor(v.severity);
        const icon = this.getSeverityIcon(v.severity);
        
        console.log(`  ${icon} ${chalk.dim(`${v.line}:${v.column}`)} ${severityColor(v.message)} ${chalk.dim(`(${v.ruleId})`)}`);
        
        if (v.codeSnippet) {
          console.log(chalk.dim(`    > ${v.codeSnippet.split('\n')[0].trim()}`));
        }
        
        console.log(`    💡 ${chalk.italic(v.suggestion)}`);
      }
    }

    console.log('\n' + chalk.dim('=================================================='));
    console.log(chalk.bold('🏆 Performance Score'));
    console.log(chalk.dim('=================================================='));
    
    const gradeColor = this.getGradeColor(score.grade);
    console.log(`\n  Overall Score: ${gradeColor(score.overall)}/100 (${gradeColor(score.grade)}) — ${score.label}`);
    
    console.log('\n  Category Breakdown:');
    for (const cat of score.categories) {
       const catColor = this.getGradeColor(cat.grade);
       const name = cat.category.charAt(0).toUpperCase() + cat.category.slice(1);
       console.log(`    • ${name.padEnd(15)} : ${catColor(cat.score.toString().padStart(3))} (${cat.grade}) [${cat.violations} issues]`);
    }

    console.log('\n' + chalk.dim('=================================================='));
    console.log(`⏱️  Scanned ${scan.totalFiles} files in ${scan.durationMs}ms.`);
    
    if (score.topRecommendation) {
       console.log(`\n🎯 ${chalk.bold('Top Recommendation:')} ${score.topRecommendation}`);
    }
    console.log();
  }

  static getSeverityColor(severity) {
    if (severity === 'critical') return chalk.red.bold;
    if (severity === 'warning') return chalk.yellow;
    return chalk.blue;
  }

  static getSeverityIcon(severity) {
    if (severity === 'critical') return chalk.red('✖');
    if (severity === 'warning') return chalk.yellow('⚠');
    return chalk.blue('ℹ');
  }

  static getGradeColor(grade) {
    if (grade === 'A') return chalk.green.bold;
    if (grade === 'B') return chalk.green;
    if (grade === 'C') return chalk.yellow;
    if (grade === 'D') return chalk.keyword('orange');
    return chalk.red.bold;
  }
}

module.exports = { TerminalReporter };
