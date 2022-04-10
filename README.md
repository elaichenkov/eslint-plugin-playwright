# ESLint Plugin Playwright

[![Test](https://github.com/playwright-community/eslint-plugin-playwright/actions/workflows/test.yml/badge.svg)](https://github.com/playwright-community/eslint-plugin-playwright/actions/workflows/test.yml)
[![NPM](https://img.shields.io/npm/v/eslint-plugin-playwright)](https://www.npmjs.com/package/eslint-plugin-playwright)

> ESLint plugin for your [Playwright](https://github.com/microsoft/playwright) testing needs.

## Installation

Yarn

```sh
yarn add -D eslint-plugin-playwright
```

NPM

```sh
npm install -D eslint-plugin-playwright
```

## Usage

This plugin bundles two configurations to work with both `@playwright/test` or `jest-playwright`.

### With [Playwright test runner](https://playwright.dev/docs/test-intro)

```json
{
  "extends": ["plugin:playwright/playwright-test"]
}
```

### With [Jest Playwright](https://github.com/playwright-community/jest-playwright)

```json
{
  "extends": ["plugin:playwright/jest-playwright"]
}
```

## Rules

### `missing-playwright-await` 🔧

Identify false positives when async Playwright APIs are not properly awaited.

#### Example

Example of **incorrect** code for this rule:

```js
expect(page).toMatchText("text");

test.step("clicks the button", async () => {
  await page.click("button");
});
```

Example of **correct** code for this rule:

```js
await expect(page).toMatchText("text");

await test.step("clicks the button", async () => {
  await page.click("button");
});
```

#### Options

The rule accepts a non-required option which can be used to specify custom matchers which this rule should also warn about. This is useful when creating your own async `expect` matchers.

```json
{
  "playwright/missing-playwright-await": [
    "error",
    { "customMatchers": ["toBeCustomThing"] }
  ]
}
```
### `no-page-pause`

Prevent usage of `page.pause()`.

#### Example

Example of **incorrect** code for this rule:

```js
await page.click('button');
await page.pause();
```

Example of **correct** code for this rule:

```js
await page.click('button');
```

### `no-skipped-test`

Disallow usage of skip annotation (e.g `test.skip` or `test.describe.skip`).

👎 Examples of <span style="color:red">**incorrect**</span> code for this rule:

```js
// Skipped test
test.skip('should skip', () => {
  // ...
});

// Skipped describe
test.describe.skip('should skip', () => {
  // ...
});

// Skipped conditional test
test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only!');
```

👍 Example of <span style="color:green">**correct**</span> code for this rule:

```js
test.skip('should work', () => {
  // ...
});

test.describe('should work too', () => {
  // ...
});
```
