/**
 * @file parser/ASTUtils.js
 * @description
 * Reusable AST traversal helpers shared across all rules.
 * Centralizing these prevents each rule from reimplementing
 * common AST patterns, keeping rule code focused on detection logic.
 */

'use strict';

const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

// ─── JSX Helpers ─────────────────────────────────────────────────────────────

/**
 * Check if a JSX element has a specific prop by name.
 * @param {import('@babel/types').JSXOpeningElement} openingElement
 * @param {string} propName
 * @returns {boolean}
 */
function jsxHasProp(openingElement, propName) {
  return openingElement.attributes.some(
    (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: propName })
  );
}

/**
 * Get the value of a JSX attribute.
 * @param {import('@babel/types').JSXOpeningElement} openingElement
 * @param {string} propName
 * @returns {import('@babel/types').Node|null}
 */
function getJSXPropValue(openingElement, propName) {
  const attr = openingElement.attributes.find(
    (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name, { name: propName })
  );
  return attr ? attr.value : null;
}

// ─── Function / Component Helpers ────────────────────────────────────────────

/**
 * Determine if a node is a React function component.
 * Heuristics: starts with uppercase, returns JSX.
 * @param {import('@babel/types').Node} node
 * @param {string} name - Detected name of the function
 * @returns {boolean}
 */
function isReactComponent(node, name) {
  if (!name) return false;
  // Must start with uppercase letter
  if (!/^[A-Z]/.test(name)) return false;
  // Must be some kind of function
  return (
    t.isFunctionDeclaration(node) ||
    t.isFunctionExpression(node) ||
    t.isArrowFunctionExpression(node)
  );
}

/**
 * Extract the name from a function node in common React component patterns:
 *   - function MyComponent() {}
 *   - const MyComponent = () => {}
 *   - const MyComponent = function() {}
 *   - export default function MyComponent() {}
 *
 * @param {import('@babel/types').Node} node
 * @param {import('@babel/traverse').NodePath} path
 * @returns {string|null}
 */
function getComponentName(node, path) {
  // Named function declaration
  if (t.isFunctionDeclaration(node) && node.id) {
    return node.id.name;
  }

  // Arrow function or function expression assigned to variable
  if (
    (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) &&
    path.parent
  ) {
    if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
      return path.parent.id.name;
    }
    // Named function expression
    if (t.isFunctionExpression(node) && node.id) {
      return node.id.name;
    }
  }

  return null;
}

// ─── Hook Helpers ─────────────────────────────────────────────────────────────

/**
 * Check if a CallExpression is a call to a named hook.
 * @param {import('@babel/types').Node} node
 * @param {string} hookName - e.g. 'useEffect', 'useState'
 * @returns {boolean}
 */
function isHookCall(node, hookName) {
  if (!t.isCallExpression(node)) return false;
  const callee = node.callee;
  // Direct call: useEffect(...)
  if (t.isIdentifier(callee, { name: hookName })) return true;
  // Namespaced call: React.useEffect(...)
  if (
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.property, { name: hookName })
  ) {
    return true;
  }
  return false;
}

/**
 * Get the dependency array from a useEffect / useCallback / useMemo call.
 * Returns null if the dep array argument is not present.
 * @param {import('@babel/types').CallExpression} node
 * @returns {import('@babel/types').ArrayExpression|null}
 */
function getDepsArray(node) {
  if (node.arguments.length < 2) return null;
  const depsArg = node.arguments[1];
  return t.isArrayExpression(depsArg) ? depsArg : null;
}

// ─── Traversal Helpers ────────────────────────────────────────────────────────

/**
 * Collect all Identifier names referenced inside a given AST node.
 * Used to find which variables a callback depends on.
 * @param {import('@babel/types').Node} node
 * @returns {Set<string>}
 */
function collectIdentifiers(node) {
  const names = new Set();
  traverse(node, {
    Identifier(innerPath) {
      // Skip property keys in member expressions (obj.foo — 'foo' is not a reference)
      if (
        t.isMemberExpression(innerPath.parent) &&
        innerPath.parent.property === innerPath.node &&
        !innerPath.parent.computed
      ) {
        return;
      }
      // Skip JSX attribute names
      if (t.isJSXAttribute(innerPath.parent)) return;
      names.add(innerPath.node.name);
    },
  }, null, {});
  return names;
}

/**
 * Extract the names from an ArrayExpression (dep array).
 * Only extracts simple Identifier elements (ignores complex expressions).
 * @param {import('@babel/types').ArrayExpression} arrayExpr
 * @returns {Set<string>}
 */
function extractDepArrayNames(arrayExpr) {
  const names = new Set();
  for (const element of arrayExpr.elements) {
    if (element && t.isIdentifier(element)) {
      names.add(element.name);
    } else if (element && t.isMemberExpression(element)) {
      // e.g. obj.prop — extract the root identifier
      let current = element;
      while (t.isMemberExpression(current)) {
        current = current.object;
      }
      if (t.isIdentifier(current)) names.add(current.name);
    }
  }
  return names;
}

/**
 * Get a short code snippet from source lines around a given line number.
 * @param {string[]} lines - Source file lines
 * @param {number} line - 1-indexed line number
 * @param {number} [context=1] - Number of lines before/after to include
 * @returns {string}
 */
function getCodeSnippet(lines, line, context = 1) {
  const start = Math.max(0, line - 1 - context);
  const end = Math.min(lines.length - 1, line - 1 + context);
  return lines.slice(start, end + 1).join('\n').trim();
}

/**
 * Check if a node contains JSX (returns JSX or has JSX children).
 * @param {import('@babel/types').Node} node
 * @returns {boolean}
 */
function containsJSX(node) {
  let found = false;
  try {
    traverse(node, {
      JSXElement() { found = true; },
      JSXFragment() { found = true; },
    }, null, {});
  } catch (_) {
    // traverse may throw on detached nodes — safe to ignore
  }
  return found;
}

/**
 * Check if a CallExpression is an array method (map, filter, etc.)
 * @param {import('@babel/types').Node} node
 * @param {string[]} methods
 * @returns {boolean}
 */
function isArrayMethod(node, methods) {
  if (!t.isCallExpression(node)) return false;
  const { callee } = node;
  if (!t.isMemberExpression(callee)) return false;
  const propName = t.isIdentifier(callee.property)
    ? callee.property.name
    : null;
  return propName !== null && methods.includes(propName);
}

module.exports = {
  jsxHasProp,
  getJSXPropValue,
  isReactComponent,
  getComponentName,
  isHookCall,
  getDepsArray,
  collectIdentifiers,
  extractDepArrayNames,
  getCodeSnippet,
  containsJSX,
  isArrayMethod,
};
