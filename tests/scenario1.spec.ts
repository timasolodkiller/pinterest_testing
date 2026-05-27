import { test, expect, chromium, type Locator } from '@playwright/test';
import path from 'path';

async function isReacted(reactButton: Locator) {
  return (await reactButton.getAttribute('aria-pressed')) === 'true';
}

test('scenario 1: search pin and react', async () => {
  test.setTimeout(120000);

  const profilePath = path.resolve(__dirname, '../pinterest');
  const context = await chromium.launchPersistentContext(profilePath, {
    headless: false,
  });

  try {
    const page = context.pages()[0] ?? await context.newPage();

    await page.goto('https://ru.pinterest.com/', {
      waitUntil: 'domcontentloaded',
    });

    const search = page.locator('[data-test-id="search-box-input"]');
    await expect(search).toBeVisible({ timeout: 60000 });

    await search.click();
    await search.fill('плов');
    await search.press('Enter');

    const firstPin = page.locator('a[href*="/pin/"]').first();
    await expect(firstPin).toBeVisible({ timeout: 60000 });
    await firstPin.click();

    const reactButton = page.locator('[data-test-id="react-button"]');
    await expect(reactButton).toBeVisible({ timeout: 60000 });

    const reactionBefore = await isReacted(reactButton);
    console.log('Reaction before:', reactionBefore);

    if (reactionBefore) {
      await reactButton.click();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-test-id="react-button"]')).toBeVisible({ timeout: 60000 });
    }

    await page.locator('[data-test-id="react-button"]').click();

    await page.reload({ waitUntil: 'domcontentloaded' });

    const reactButtonAfter = page.locator('[data-test-id="react-button"]');
    await expect(reactButtonAfter).toBeVisible({ timeout: 60000 });

    const reactionAfter = await isReacted(reactButtonAfter);
    console.log('Reaction after:', reactionAfter);

    expect(reactionAfter).toBe(true);
  } finally {
    await context.close();
  }
});
