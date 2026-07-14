/**
 * @file cli/commands/scan.js
 * @description
 * The main 'scan' command.
 */

'use strict';

const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const open = require('open');
const { loadConfig } = require('../../config/ConfigLoader');
const { ProjectScanner } = require('../../scanner/ProjectScanner');
const { ScoreCalculator } = require('../../score/ScoreCalculator');
const { TerminalReporter } = require('../../reporters/TerminalReporter');
const { JsonReporter } = require('../../reporters/JsonReporter');
const { HtmlReporter } = require('../../reporters/HtmlReporter');

/**
 * Handle the 'scan' command.
 * @param {string} targetDir
 * @param {object} cmdOptions
 */
async function handleScan(targetDir = '.', cmdOptions) {
  const rootDir = path.resolve(process.cwd(), targetDir);
  
  // 1. Load config
  const config = loadConfig(rootDir); // In the future, cmdOptions.config can override
  
  // 2. Initialize Spinner
  const spinner = ora(`Discovering React files in ${chalk.bold(rootDir)}...`).start();

  try {
    // 3. Run Scan
    const scanResult = await ProjectScanner.scan(rootDir, config);
    
    spinner.succeed(`Scanned ${scanResult.totalFiles} files in ${scanResult.durationMs}ms`);

    // 4. Calculate Score
    const score = ScoreCalculator.compute(scanResult.allViolations);

    const reportData = {
      version: require('../../../package.json').version,
      scan: scanResult,
      score,
      config,
    };

    // 5. Generate Outputs
    if (cmdOptions.score) {
      // Just print the score
      console.log(`\n🏆 Performance Score: ${chalk.bold.green(score.overall + '/100')} (${score.grade})`);
      return;
    }

    TerminalReporter.generate(reportData);

    if (cmdOptions.json) {
      const jsonPath = JsonReporter.generate(reportData);
      console.log(`💾 JSON report saved to: ${chalk.blue(jsonPath)}`);
    }

    if (cmdOptions.html) {
      const htmlPath = HtmlReporter.generate(reportData);
      console.log(`🌐 HTML report saved to: ${chalk.blue(htmlPath)}`);
      
      // Auto-open if possible
      try {
        await open(htmlPath);
      } catch (err) {
        console.log(chalk.dim(`(Could not auto-open browser: ${err.message})`));
      }
    }

  } catch (error) {
    spinner.fail('Scan failed due to an internal error.');
    console.error(chalk.red('\nError Details:'), error);
    process.exit(1);
  }
}

module.exports = { handleScan };
