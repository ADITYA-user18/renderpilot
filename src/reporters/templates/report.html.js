/**
 * @file reporters/templates/report.html.js
 * @description
 * Standalone HTML template for the RenderPilot report.
 * Uses vanilla JS and CSS to ensure zero runtime dependencies.
 */

'use strict';

/**
 * Returns the full HTML string for the report.
 * @param {string} jsonData - JSON string of the report data
 * @returns {string}
 */
function getHtmlTemplate(jsonData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RenderPilot Analysis Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    :root {
      --bg: #fafafa;
      --surface: #ffffff;
      --border: #eaeaea;
      --text: #11181c;
      --text-muted: #687076;
      --primary: #0070f3;
      --critical: #e5484d;
      --warning: #f7ce00;
      --warning-text: #705e00;
      --info: #0090ff;
      --success: #30a46c;
      --code-bg: #f1f3f5;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #111111;
        --surface: #1a1a1a;
        --border: #333333;
        --text: #ededed;
        --text-muted: #a1a1a1;
        --code-bg: #222222;
        --warning-text: #f7ce00;
      }
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    header {
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .meta {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    /* Top Stats Banner */
    .top-banner {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2.5rem;
      margin-bottom: 3rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 4rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    
    @media (max-width: 900px) {
      .top-banner {
        flex-direction: column;
        gap: 2rem;
      }
    }

    .score-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 250px;
    }

    .score-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 8px solid var(--border);
      font-size: 3.5rem;
      font-weight: 700;
      letter-spacing: -0.04em;
      margin-bottom: 1rem;
    }

    .score-title {
      text-align: center;
      font-weight: 600;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .top-rec {
      font-size: 0.875rem;
      color: var(--text-muted);
      text-align: center;
      padding: 0.5rem 1rem;
      background: var(--code-bg);
      border-radius: 8px;
    }

    .stats-section {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stats-group h3 {
      margin-top: 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .stats-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .stats-list li {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.95rem;
    }

    .stats-list li:last-child {
      border-bottom: none;
    }

    .stat-label {
      color: var(--text-muted);
      font-weight: 500;
    }

    .stat-value {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    /* Files Panel: Accordion Files */
    .files-panel h2 {
      margin-top: 0;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 1.5rem;
    }

    .file-accordion {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      transition: border-color 0.2s;
    }

    .file-accordion.all-fixed {
      opacity: 0.6;
      border-color: var(--success);
    }

    .file-header {
      background: var(--surface);
      padding: 1.25rem 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.2s;
    }

    .file-header:hover {
      background: var(--code-bg);
    }

    .file-header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .file-header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .file-stats {
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      gap: 0.5rem;
    }
    
    .file-stats span {
      background: var(--code-bg);
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      border: 1px solid var(--border);
    }

    .chevron {
      transition: transform 0.3s ease;
      color: var(--text-muted);
    }

    .file-accordion.open .chevron {
      transform: rotate(180deg);
    }

    .file-content {
      display: none;
      border-top: 1px solid var(--border);
      background: var(--bg);
    }

    .file-accordion.open .file-content {
      display: block;
    }

    /* Violations */
    .violation-item {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      transition: opacity 0.3s ease;
      position: relative;
    }
    
    .violation-item.fixed {
      opacity: 0.4;
    }
    
    .violation-item.fixed::after {
      content: 'FIXED';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: var(--success);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .violation-item:last-child {
      border-bottom: none;
    }

    .v-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .badge {
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge.critical { background: rgba(229, 72, 77, 0.1); color: var(--critical); border: 1px solid rgba(229, 72, 77, 0.2); }
    .badge.warning { background: rgba(247, 206, 0, 0.1); color: var(--warning-text); border: 1px solid rgba(247, 206, 0, 0.2); }
    .badge.info { background: rgba(0, 144, 255, 0.1); color: var(--info); border: 1px solid rgba(0, 144, 255, 0.2); }

    .v-title {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .v-line {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }

    .v-message {
      font-size: 0.95rem;
      margin-bottom: 1rem;
      color: var(--text);
    }

    .code-block-wrapper {
      position: relative;
      margin-bottom: 1rem;
    }

    pre {
      background: var(--code-bg);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      margin: 0;
      border: 1px solid var(--border);
      color: var(--text);
    }

    .v-suggestion {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(48, 164, 108, 0.05);
      border-left: 4px solid var(--success);
      border-radius: 0 8px 8px 0;
      font-size: 0.9rem;
      color: var(--text);
      margin-bottom: 1.25rem;
    }
    
    .action-row {
      display: flex;
      justify-content: flex-start;
    }

    .btn-fix {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-fix:hover {
      background: var(--code-bg);
      border-color: var(--success);
      color: var(--success);
    }
    
    .violation-item.fixed .btn-fix {
      background: var(--success);
      color: white;
      border-color: var(--success);
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header>
      <div class="header-content">
        <div>
          <h1>✈ RenderPilot Report</h1>
          <div class="meta" id="scan-meta">Loading scan data...</div>
        </div>
      </div>
    </header>

    <div class="top-banner">
      <div class="score-section">
        <div class="score-circle" id="overall-score">--</div>
        <div class="score-title" id="score-label">--</div>
        <div class="top-rec" id="top-rec"></div>
      </div>
      
      <div class="stats-section">
        <div class="stats-group">
          <h3>Issues Summary</h3>
          <ul class="stats-list" id="stats-list">
            <!-- Stats injected here -->
          </ul>
        </div>
        
        <div class="stats-group">
          <h3>Category Grades</h3>
          <ul class="stats-list" id="categories-list">
            <!-- Categories injected here -->
          </ul>
        </div>
      </div>
    </div>

    <main class="files-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0;">Detected Violations</h2>
        <button onclick="toggleAllFiles()" style="background: var(--surface); border: 1px solid var(--border); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: var(--text);">Expand / Collapse All</button>
      </div>
      
      <div id="violations-container">
        <!-- Violations injected here -->
      </div>
    </main>
  </div>

  <script>
    const reportData = ${jsonData};
    
    // Meta Data
    document.getElementById('scan-meta').innerText = 
      \`Scanned \${reportData.scan.totalFiles} files in \${reportData.scan.durationMs}ms — \${new Date(reportData.scan.completedAt).toLocaleString()}\`;
    
    // Overall Score
    const scoreCircle = document.getElementById('overall-score');
    scoreCircle.innerText = reportData.score.overall;
    
    let color = 'var(--success)';
    if (reportData.score.grade === 'C' || reportData.score.grade === 'D') color = 'var(--warning-text)';
    if (reportData.score.grade === 'F') color = 'var(--critical)';
    scoreCircle.style.borderColor = color;
    scoreCircle.style.color = color;
    
    document.getElementById('score-label').innerText = \`Grade \${reportData.score.grade} • \${reportData.score.label}\`;
    document.getElementById('top-rec').innerText = reportData.score.topRecommendation;

    // Summary Stats
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = \`
      <li>
        <span class="stat-label">Critical Issues</span>
        <span class="stat-value" style="color: var(--critical);">\${reportData.scan.violationsBySeverity.critical || 0}</span>
      </li>
      <li>
        <span class="stat-label">Warnings</span>
        <span class="stat-value" style="color: var(--warning-text);">\${reportData.scan.violationsBySeverity.warning || 0}</span>
      </li>
      <li>
        <span class="stat-label">Info / Tips</span>
        <span class="stat-value" style="color: var(--info);">\${reportData.scan.violationsBySeverity.info || 0}</span>
      </li>
      <li>
        <span class="stat-label">Total Violations</span>
        <span class="stat-value">\${reportData.scan.totalViolations}</span>
      </li>
    \`;

    // Category Grades
    const catList = document.getElementById('categories-list');
    catList.innerHTML = reportData.score.categories.map(c => {
        let catColor = 'var(--text)';
        if (c.grade === 'A' || c.grade === 'B') catColor = 'var(--success)';
        if (c.grade === 'C' || c.grade === 'D') catColor = 'var(--warning-text)';
        if (c.grade === 'F') catColor = 'var(--critical)';
        
        return \`
        <li>
          <span class="stat-label">\${c.category.charAt(0).toUpperCase() + c.category.slice(1)}</span>
          <span class="stat-value" style="color: \${catColor};">\${c.score} (\${c.grade})</span>
        </li>
      \`}).join('');

    // Populate Files
    const container = document.getElementById('violations-container');
    const fileGroups = {};
    
    reportData.scan.allViolations.forEach((v, index) => {
       // Attach a unique ID to each violation for the checkbox logic
       v.uniqueId = 'v_' + index;
       if (!fileGroups[v.filePath]) fileGroups[v.filePath] = [];
       fileGroups[v.filePath].push(v);
    });

    if (Object.keys(fileGroups).length === 0) {
      container.innerHTML = \`
        <div class="file-accordion" style="padding: 4rem 2rem; text-align: center; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 1rem; color: var(--success);">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3 style="margin:0; color: var(--text);">No violations found!</h3>
          <p>Your codebase is perfectly optimized according to RenderPilot.</p>
        </div>\`;
    } else {
      let html = '';
      let fileIndex = 0;
      
      for (const [filePath, violations] of Object.entries(fileGroups)) {
        // Extract a clean relative path
        const pathParts = filePath.split(/[\\\\/]/);
        const relPath = pathParts.slice(Math.max(pathParts.length - 3, 0)).join('/');
        
        let vHtml = '';
        let criticalCount = 0;
        let warningCount = 0;
        
        violations.forEach(v => {
           if (v.severity === 'critical') criticalCount++;
           if (v.severity === 'warning') warningCount++;
           
           vHtml += \`
            <div class="violation-item" id="\${v.uniqueId}">
              <div class="v-header">
                <span class="badge \${v.severity}">\${v.severity}</span>
                <span class="v-title">\${v.ruleName}</span>
                <span class="v-line">Line \${v.line}</span>
              </div>
              <div class="v-message">\${v.message}</div>
              \${v.codeSnippet ? \`<div class="code-block-wrapper"><pre><code>\${v.codeSnippet.replace(/</g, '&lt;')}</code></pre></div>\` : ''}
              <div class="v-suggestion">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>\${v.suggestion}</span>
              </div>
              <div class="action-row">
                <button class="btn-fix" onclick="toggleFix('\${v.uniqueId}', '\${filePath}')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span class="btn-text">Mark as Fixed</span>
                </button>
              </div>
            </div>
           \`;
        });

        // NOTE: We omit 'open' class so it is closed by default
        html += \`
          <div class="file-accordion" id="file_\${fileIndex}" data-filepath="\${filePath}">
            <div class="file-header" onclick="toggleAccordion('file_\${fileIndex}')">
              <div class="file-header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                \${relPath}
              </div>
              <div class="file-header-right">
                <div class="file-stats">
                  \${criticalCount > 0 ? \`<span style="color: var(--critical); border-color: rgba(229, 72, 77, 0.3);">\${criticalCount} Crit</span>\` : ''}
                  \${warningCount > 0 ? \`<span style="color: var(--warning-text); border-color: rgba(247, 206, 0, 0.3);">\${warningCount} Warn</span>\` : ''}
                  <span>\${violations.length} Total</span>
                </div>
                <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            <div class="file-content">
              \${vHtml}
            </div>
          </div>
        \`;
        
        fileIndex++;
      }
      container.innerHTML = html;
    }

    // Interactivity Functions
    function toggleAccordion(id) {
      const el = document.getElementById(id);
      if (el.classList.contains('open')) {
        el.classList.remove('open');
      } else {
        el.classList.add('open');
      }
    }
    
    let allOpen = false;
    function toggleAllFiles() {
      const accordions = document.querySelectorAll('.file-accordion');
      allOpen = !allOpen;
      accordions.forEach(acc => {
        if (allOpen) acc.classList.add('open');
        else acc.classList.remove('open');
      });
    }

    function toggleFix(violationId, filePath) {
      const vEl = document.getElementById(violationId);
      const isFixed = vEl.classList.toggle('fixed');
      
      const btnText = vEl.querySelector('.btn-text');
      btnText.innerText = isFixed ? 'Unmark Fixed' : 'Mark as Fixed';
      
      // Check if all violations in this file are fixed
      const fileAccordion = vEl.closest('.file-accordion');
      const allViolations = fileAccordion.querySelectorAll('.violation-item');
      const fixedViolations = fileAccordion.querySelectorAll('.violation-item.fixed');
      
      if (allViolations.length === fixedViolations.length) {
        fileAccordion.classList.add('all-fixed');
        // Auto close it when done
        fileAccordion.classList.remove('open');
      } else {
        fileAccordion.classList.remove('all-fixed');
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { getHtmlTemplate };
