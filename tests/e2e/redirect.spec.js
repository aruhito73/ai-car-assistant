import { test, expect } from './fixtures/baseFixture.js';

test.describe('Routing & Redirect Logic under Empty State', () => {

  test('Should redirect to Dashboard when trying to access Chat without profile', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // Check we start at dashboard or can click profile
    await expect(page).toHaveURL(/.*#dashboard/);

    // Try to navigate to chat via hash change
    await page.evaluate(() => {
      window.location.hash = 'chat';
    });
    
    // It should immediately redirect back to dashboard
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*#dashboard/);
  });

  test('Should redirect to Dashboard when trying to access Service Book without profile', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // Try to navigate to services via hash change
    await page.evaluate(() => {
      window.location.hash = 'services';
    });

    // It should immediately redirect back to dashboard
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*#dashboard/);
  });

  test('Should redirect to Dashboard when trying to access Finance without profile', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // Try to navigate to finance via hash change
    await page.evaluate(() => {
      window.location.hash = 'finance';
    });

    // It should immediately redirect back to dashboard
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*#dashboard/);
  });

  test('Should allow access to Parts & Reference without profile (shows empty parts state)', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // Try to navigate to parts via hash change
    await page.evaluate(() => {
      window.location.hash = 'parts';
    });

    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*#parts/);
    await expect(page.locator('body')).toContainText('Add a vehicle profile first to see auto-matched OEM parts');
  });

  test('Should allow access to Profile without profile', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // Try to navigate to profile via hash change
    await page.evaluate(() => {
      window.location.hash = 'profile';
    });

    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*#profile/);
  });

});
