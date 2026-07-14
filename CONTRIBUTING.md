# Contributing to RenderPilot

Thank you for your interest in improving RenderPilot!

RenderPilot is designed to be highly modular. The easiest and most impactful way to contribute is by adding new rules.

## Architecture Overview

1. **Parser Layer:** Uses `@babel/parser` to turn source code into an Abstract Syntax Tree (AST).
2. **Scanner Layer:** Uses `fast-glob` to recursively find all React files.
3. **Rule Engine:** Iterates over rules. Each rule traverses the AST using `@babel/traverse`.
4. **Scoring Engine:** Computes a 0-100 grade based on violations.
5. **Reporters:** Output results in Terminal, JSON, or HTML.

## How to Add a New Rule

Every rule is an independent, self-contained module located in `src/rules/implementations/`.

### 1. Create your rule file
Create a new file e.g., `src/rules/implementations/R010_MyNewRule.js`:

```javascript
'use strict';
const { AbstractRule } = require('../base/AbstractRule');

class R010_MyNewRule extends AbstractRule {
  constructor() {
    super({
      id: 'R010',
      name: 'My Custom Rule',
      description: 'Detects bad patterns in components.',
      severity: 'warning',
      category: 'architecture',
    });
  }

  detect(context) {
    const violations = [];
    
    // Traverse the AST (context.ast)
    // If you find an issue, push a violation:
    // violations.push(this.createViolation({ ... }));
    
    return violations;
  }
}

module.exports = { R010_MyNewRule };
```

### 2. Utilize `ASTUtils.js`
Check `src/parser/ASTUtils.js`. It contains helpful, reusable methods like `isReactComponent`, `getDepsArray`, `getCodeSnippet`, etc., so you don't have to write boilerplate AST traversal logic.

### 3. Register your rule
Open `src/rules/index.js` and add your rule to the registry:

```javascript
const { R010_MyNewRule } = require('./implementations/R010_MyNewRule');

ruleRegistry.register(new R010_MyNewRule());
```

### 4. Test it!
1. Add a failing case in `sample-project/src/BadComponent.jsx`.
2. Run `npm run dev scan ./sample-project`.
3. Verify your rule correctly flags the issue.

## Pull Request Process
1. Fork the repo and create your branch from `main`.
2. If you've added code, add tests (currently we use Jest).
3. Ensure the test suite passes: `npm test`.
4. Ensure your code lints: `npm run lint`.
5. Submit your PR with a clear description of the new rule or bugfix.
