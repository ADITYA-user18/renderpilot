/**
 * @file reporters/HtmlReporter.js
 * @description
 * Generates an interactive HTML report by injecting scan results into a template.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { getHtmlTemplate } = require('./templates/report.html');

class HtmlReporter {
  /**
   * Generate an HTML report file.
   * @param {import('../types').ReportData} reportData
   * @returns {string} Absolute path to the generated HTML file
   */
  static generate(reportData) {
    const outputDir = path.resolve(process.cwd(), reportData.config.outputDir);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'renderpilot-report.html');
    
    // Inject the raw JSON data into the window object of the HTML template
    const jsonString = JSON.stringify(reportData, null, 2);
    
    // Escape script tags in JSON to prevent XSS / broken HTML
    const safeJsonString = jsonString.replace(/</g, '\\u003c');
    
    const htmlContent = getHtmlTemplate(safeJsonString);

    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
    
    return outputPath;
  }
}

module.exports = { HtmlReporter };
