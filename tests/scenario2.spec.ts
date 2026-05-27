import { test, expect } from '@playwright/test';
import fs from 'fs';

test('scenario 2: search and open first pin', async ({ page }) => {
  test.setTimeout(120000);

  fs.mkdirSync('artifacts', { recursive: true });

  await page.goto('https://ru.pinterest.com/', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByRole('button', { name: /принять все|accept all|reject all|отклонить/i })
    .first()
    .click({ timeout: 5000 })
    .catch(() => {});

  const exploreLink = page
    .locator('[data-test-id="unauth-header"]')
    .getByRole('link', { name: /просмотреть|explore/i });
  await expect(exploreLink).toBeVisible({ timeout: 60000 });
  await exploreLink.click();

  const search = page.locator('[data-test-id="search-box-input"]');
  await expect(search).toBeVisible({ timeout: 60000 });

  await search.click();
  await search.fill('плов');
  await search.press('Enter');
  await expect(page).toHaveURL(/q=.*%D0%BF%D0%BB%D0%BE%D0%B2|q=.*плов/, { timeout: 60000 });

  const firstPin = page.locator('a[href*="/pin/"]').first();
  await expect(firstPin).toBeVisible({ timeout: 60000 });
  const firstPinHref = await firstPin.getAttribute('href');
  expect(firstPinHref).toBeTruthy();

  await firstPin.click({ timeout: 10000 }).catch(async () => {
    await page.goto(new URL(firstPinHref!, page.url()).toString(), {
      waitUntil: 'domcontentloaded',
    });
  });
  await expect(page).toHaveURL(/\/pin\//, { timeout: 60000 });

  await page.screenshot({
    path: 'artifacts/final-page.png',
    fullPage: true,
  });

  fs.writeFileSync('artifacts/final-page.html', await page.content());
});
