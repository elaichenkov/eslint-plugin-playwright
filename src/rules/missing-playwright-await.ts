import { Rule } from 'eslint';
import * as ESTree from 'estree';
import {
  getExpectType,
  getMatchers,
  getStringValue,
  isIdentifier,
  isPropertyAccessor,
} from '../utils/ast';

const validTypes = new Set([
  'AwaitExpression',
  'ReturnStatement',
  'ArrowFunctionExpression',
]);

const expectPlaywrightMatchers = [
  'toBeChecked',
  'toBeDisabled',
  'toBeEnabled',
  'toEqualText', // deprecated
  'toEqualUrl',
  'toEqualValue',
  'toHaveFocus',
  'toHaveSelector',
  'toHaveSelectorCount',
  'toHaveText', // deprecated
  'toMatchAttribute',
  'toMatchComputedStyle',
  'toMatchText',
  'toMatchTitle',
  'toMatchURL',
  'toMatchValue',
];

const playwrightTestMatchers = [
  'toBeChecked',
  'toBeDisabled',
  'toBeEditable',
  'toBeEmpty',
  'toBeEnabled',
  'toBeFocused',
  'toBeHidden',
  'toBeVisible',
  'toContainText',
  'toHaveAttribute',
  'toHaveClass',
  'toHaveCount',
  'toHaveCSS',
  'toHaveId',
  'toHaveJSProperty',
  'toBeOK',
  'toHaveScreenshot',
  'toHaveText',
  'toHaveTitle',
  'toHaveURL',
  'toHaveValue',
];

function getCallType(
  node: ESTree.CallExpression & Rule.NodeParentExtension,
  awaitableMatchers: Set<string>,
) {
  // test.step
  if (
    node.callee.type === 'MemberExpression' &&
    isIdentifier(node.callee.object, 'test') &&
    isPropertyAccessor(node.callee, 'step')
  ) {
    return { messageId: 'testStep' };
  }

  const expectType = getExpectType(node);
  if (!expectType) return;

  // expect.poll
  if (expectType === 'poll') {
    return { messageId: 'expectPoll' };
  }

  // expect with awaitable matcher
  const [lastMatcher] = getMatchers(node).slice(-1);
  const matcherName = getStringValue(lastMatcher);

  if (awaitableMatchers.has(matcherName)) {
    return { data: { matcherName }, messageId: 'expect' };
  }
}

function isPromiseAll(node: Rule.Node) {
  return node.type === 'ArrayExpression' &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression' &&
    isIdentifier(node.parent.callee.object, 'Promise') &&
    isIdentifier(node.parent.callee.property, 'all')
    ? node.parent
    : null;
}

function checkValidity(node: Rule.Node): ESTree.Node | undefined {
  if (validTypes.has(node.parent.type)) return;

  const promiseAll = isPromiseAll(node.parent);
  return promiseAll
    ? checkValidity(promiseAll)
    : node.parent.type === 'MemberExpression' ||
      (node.parent.type === 'CallExpression' && node.parent.callee === node)
    ? checkValidity(node.parent)
    : node;
}

export default {
  create(context) {
    const options = context.options[0] || {};
    const awaitableMatchers = new Set([
      ...expectPlaywrightMatchers,
      ...playwrightTestMatchers,
      // Add any custom matchers to the set
      ...(options.customMatchers || []),
    ]);

    return {
      CallExpression(node) {
        const result = getCallType(node, awaitableMatchers);
        const reportNode = result ? checkValidity(node) : undefined;

        if (result && reportNode) {
          context.report({
            data: result.data,
            fix: (fixer) => fixer.insertTextBefore(node, 'await '),
            messageId: result.messageId,
            node: node.callee,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: `Identify false positives when async Playwright APIs are not properly awaited.`,
      recommended: true,
    },
    fixable: 'code',
    messages: {
      expect: "'{{matcherName}}' must be awaited or returned.",
      expectPoll: "'expect.poll' matchers must be awaited or returned.",
      testStep: "'test.step' must be awaited or returned.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          customMatchers: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
} as Rule.RuleModule;
