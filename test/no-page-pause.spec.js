const rule = require('../lib/rules/no-page-pause');
const { wrapInTest, runRuleTester } = require('../lib/utils/rule-tester');

const invalid = (code) => ({
  code: wrapInTest(code),
  errors: [{ messageId: 'noPagePause' }],
});

const valid = (code) => ({
  code: wrapInTest(code),
});

runRuleTester('no-page-pause', rule, {
  invalid: [invalid('await page.pause()')],
  valid: [valid('await page.click()'), valid('await expect(page).toBePaused()')],
});
