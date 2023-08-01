import { test, expect } from '@playwright/test';

test('Empty Parameter', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page).toHaveScreenshot();
});