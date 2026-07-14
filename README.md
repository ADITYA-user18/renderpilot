# RenderPilot ✈️

**The Intelligent React Performance Analysis CLI**

RenderPilot statically analyzes your React (**JS/TS/JSX/TSX**) codebase to detect performance anti-patterns, explain why they occur, estimate their impact, and suggest pragmatic fixes. It generates a comprehensive **Performance Score** and provides a developer-friendly interactive dashboard to track your fixes.

---

## 🌟 Key Features

- **Built for Modern Stacks:** Seamlessly supports TypeScript (`.ts`, `.tsx`) and modern JavaScript syntax out of the box using Babel. No complex configuration required.
- **Smart Component Detection:** Uses an advanced AST (Abstract Syntax Tree) engine to identify React Component boundaries. This means it safely ignores backend files (Express, NestJS), utility functions, and non-React files—preventing false positives.
- **Interactive Developer Dashboard:** Generates a stunning, Vercel-inspired HTML report with collapsible file accordions, line-number highlighting, and a **"Mark as Fixed"** workflow to easily track your debugging progress.
- **Pragmatic, Senior-Level Advice:** RenderPilot is designed to be a Performance Advisor, not a dogmatic linter.
  - Differentiates between array mutations (`.sort()`) vs pure array methods (`.filter()`).
  - Only recommends `React.memo` for components that actually receive props.
- **Performance Grading:** Get an intelligent overall grade (A-F) based on severity-weighted categories (Rendering, Hooks, Architecture, Maintainability).

## 🚀 Installation

```bash
npm install -g renderpilot
# or
npx renderpilot scan .
```

## 🛠️ Usage

Scan your current directory (Outputs to Terminal):
```bash
renderpilot scan .
```

**Recommended:** Generate the interactive HTML dashboard:
```bash
renderpilot report .
# Equivalent to: renderpilot scan . --html
```
*(This will automatically open `renderpilot-report.html` in your default browser).*

Generate a JSON payload for CI integration:
```bash
renderpilot scan . --json
```

Get just the score (useful for CI/CD pipeline gates):
```bash
renderpilot scan . --score
```

## ⚙️ Configuration

RenderPilot works zero-config out of the box. To customize it, create a `renderpilot.config.js` file in your project root:

```javascript
module.exports = {
  // Directories to ignore during scan
  ignoreDirs: ['node_modules', 'dist', 'build', '.next'],
  
  // Maximum component lines before triggering a warning
  maxComponentLines: 300,
  
  // Override severity for specific rules
  severityOverrides: {
    'R001': 'critical', // Missing key prop
  },
  
  // Explicitly disable certain rules
  disabledRules: ['R004', 'R007'],
  
  // Output directory for HTML and JSON reports
  outputDir: '.renderpilot'
};
```

## 📏 Core Rules

| ID | Name | Category | Severity |
|----|------|----------|----------|
| **R001** | Missing Key Prop | Rendering | Warning |
| **R002** | Infinite useEffect Loop | Hooks | Critical |
| **R003** | Incorrect Dependency Array | Hooks | Warning |
| **R004** | Large Component | Architecture | Info |
| **R005** | Inline Callback Detection | Rendering | Info |
| **R006** | Heavy Calculations in Render | Rendering | Warning |
| **R007** | React.memo Candidate | Rendering | Info |
| **R008** | Nested Component Declarations | Architecture | Critical |
| **R009** | Unused React State | Maintainability| Warning |

## 💯 How the Scoring Works

Your project starts with 100 points. Points are deducted based on rule violations, severity, and category weight.
- **Critical Issues (-15 points)** (Multiplied by category weight)
- **Warnings (-5 points)**
- **Info (-1 point)**

Categories are weighted by performance impact:
- **Rendering** (1.5x)
- **Hooks** (1.3x)
- **Architecture** (1.0x)
- **Maintainability** (0.7x)

## 💻 Programmatic API

You can use RenderPilot as a Node.js library to integrate it into your own tools:

```javascript
const { ProjectScanner, ScoreCalculator, loadConfig } = require('renderpilot');

async function run() {
  const config = loadConfig('./src');
  const scanResult = await ProjectScanner.scan('./src', config);
  const score = ScoreCalculator.compute(scanResult.allViolations);
  
  console.log('Score:', score.overall);
}
```

## 📄 License

MIT © RenderPilot Contributors
