import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';

async function acceptCookiesIfVisible(page: Page) {
  await page.getByRole('button', { name: /принять все|accept all/i })
    .first()
    .click({ timeout: 5000 })
    .catch(() => {});
}

test('scenario 2: search and save results page', async ({ page }) => {
  test.setTimeout(120000);

  fs.mkdirSync('artifacts', { recursive: true });

  await page.goto('https://ru.pinterest.com/', {
    waitUntil: 'domcontentloaded',
  });

  await acceptCookiesIfVisible(page);

  const exploreLink = page
    .locator('[data-test-id="unauth-header"]')
    .getByRole('link', { name: /просмотреть|explore/i });
  await expect(exploreLink).toBeVisible({ timeout: 60000 });
  await exploreLink.click();

  const search = page.locator('[data-test-id="search-box-input"]');
  await expect(search).toBeVisible({ timeout: 60000 });
  await acceptCookiesIfVisible(page);

  await search.click();
  await search.fill('плов');
  await search.press('Enter');
  await expect(page).toHaveURL(/q=.*%D0%BF%D0%BB%D0%BE%D0%B2|q=.*плов/, { timeout: 60000 });
  await acceptCookiesIfVisible(page);

  await expect(page.locator('a[href^="/pin/"]').first()).toBeVisible({ timeout: 60000 });
  await expect(page.locator('img').first()).toBeVisible({ timeout: 60000 });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'artifacts/final-page.png',
    fullPage: true,
  });

  fs.writeFileSync('artifacts/final-page.html', await page.content());
});
