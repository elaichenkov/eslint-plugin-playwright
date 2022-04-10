const { RuleTester } = require('eslint');
const rule = require('../lib/rules/no-skipped-test');

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 2018,
  },
});

const wrapInTest = (input) => `test('verify noSkippedTest', async () => { ${input} })`;

const invalid = (code) => ({
  code: wrapInTest(code),
  errors: [{ messageId: 'noSkippedTest' }],
});

const valid = (code) => ({
  code: wrapInTest(code),
});

new RuleTester().run('no-skipped-test', rule, {
  invalid: [
    // Skip describe
    invalid("test.describe.skip('skip this describe', async ({ page }) => {});"),

    // Skip test
    invalid("test.skip('skip this test', async () => {});"),

    // Conditionally skip a describe
    invalid("test.describe('skip this test', ({ browserName }) => { test.skip(browserName === 'firefox', 'skip');});"),

    // Conditionally skip a test
    invalid("test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only!');"),
  ],
  valid: [
    // Describe without skip annotation
    valid("test.describe('describe tests', () => {});"),

    // Test without skip annotation
    valid("test('one', async ({ page }) => {});"),

    // Test with another annotation (fixme)
    valid("test.fixme(isMobile, 'Settings page does not work in mobile yet');"),
  ],
});
