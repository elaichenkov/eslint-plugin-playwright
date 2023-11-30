## Disallow using raw locators (`no-raw-locators`)

Prefer using user-facing locators over raw locators to make tests more robust.

Check out the [Playwright documentation](https://playwright.dev/docs/locators)
for more information.

## Rule Details

Example of **incorrect** code for this rule:

```javascript
await page.locator('button').click();
```

Example of **correct** code for this rule:

```javascript
await page.getByRole('button').click();
```

```javascript
await page.getByRole('button', {
  name: 'Submit',
});
```
