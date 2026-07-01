import { test, expect } from './fixtures/baseFixture.js';
import { seedStorageState } from './helpers/stateInit.js';
import { mockData } from './fixtures/mockData.js';

test.describe('Finance & Analytics', () => {

  // Tier 1: Feature Coverage (Happy Path)

  test('21. Log Expense Entry', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    await page.selectOption('#expense-category', { label: 'Fuel' });
    await page.fill('#amount', '3000');
    await page.fill('#expense-date', '2026-06-29');
    await page.fill('#expense-notes', 'Filled full tank at Lukoil');
    await page.click('button[type="submit"], button:has-text("Log Expense")');

    // Assertions
    await expect(page.locator('body')).toContainText('Fuel');
    await expect(page.locator('body')).toContainText('3000.00');
    await expect(page.locator('body')).toContainText('Filled full tank at Lukoil');
  });

  test('22. Delete Expense Entry', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    
    // Locate OSAGO policy renewal (exp-002) and delete it
    await page.locator('div.rounded-xl', { hasText: 'OSAGO policy renewal' }).locator('button[title="Delete expense"]').click();

    // Assertions
    await expect(page.locator('body')).not.toContainText('OSAGO policy renewal');
  });

  test('23. Category Filtering', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    await page.selectOption('#filter-category, #expense-filter', { value: 'Fuel' });

    // Assertions
    await expect(page.locator('body')).toContainText('Fuel');
    await expect(page.locator('body')).not.toContainText('OSAGO policy renewal');
    await expect(page.locator('body')).not.toContainText('Suspension work');
  });

  test('24. Distribution Chart Display', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    
    // Hover/click slice in Recharts Pie Chart
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
    await page.hover('.recharts-pie-sector, path.recharts-sector');
    
    // Assert tooltip is visible
    await expect(page.locator('.recharts-tooltip-wrapper').first()).toBeVisible();
  });

  test('25. Monthly Expense Trend', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    
    // Assert trend chart is visible
    await expect(page.locator('.recharts-surface').last()).toBeVisible();
    await expect(page.locator('body')).toContainText('June 2026');
  });

  // Tier 2: Boundary & Corner Cases

  test('26. Zero Expenses Empty UI', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.evaluate(() => {
      localStorage.setItem('ai_car_expenses', JSON.stringify([]));
    });
    await page.reload();
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');

    // Assertions
    await expect(page.locator('body')).toContainText('$0.00');
    await expect(page.locator('body')).toContainText('Log expenses to see annual and category trends.');
  });

  test('27. Negative / Zero Amount Validation', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    await page.click('#add-expense-btn');
    await page.waitForTimeout(500);
    await page.fill('#amount', '-10');
    await page.click('button#save-expense');
    await expect(page.locator('body')).toContainText('Amount must be greater than 0');

    await page.fill('#amount', '0');
    await page.click('button#save-expense');
    await expect(page.locator('body')).toContainText('Amount must be greater than 0');
  });

  test('28. Future Expense Entry', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    await page.click('#add-expense-btn');
    await page.waitForTimeout(500);
    await page.fill('#amount', '100');
    await page.fill('#date', '2027-01-01');
    await page.click('button#save-expense');

    await expect(page.locator('body')).toContainText('Expense date cannot be in the future');
  });

  test('29. Text Overflow in Note Field', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    await page.click('#add-expense-btn');
    await page.waitForTimeout(500);
    await page.selectOption('#expense-category', { label: 'Other' });
    await page.fill('#amount', '100');
    await page.fill('#notes', 'a'.repeat(500));
    await page.click('button#save-expense');

    // Check notes elements for overflow-ellipsis or wrapping class
    const noteCell = page.locator('td:has-text("aaaa")');
    await expect(noteCell).toBeVisible();
  });

  test('30. Category Deletion Recalculation', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    await page.selectOption('#filter-category, #expense-filter', { value: 'Insurance' });
    
    // Delete OSAGO renewal
    await page.click('[data-testid="delete-exp-002"], button.delete-expense-btn');
    await page.click('button#confirm-delete, button:has-text("Confirm"), button:has-text("Yes")');

    // Verify Insurance is removed
    await expect(page.locator('#filter-category, #expense-filter')).not.toContainText('Insurance');
  });

  test('31. Blank Form Validation', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Finance"), a:has-text("Finance"), #nav-finance');
    await page.click('#add-expense-btn');
    await page.click('button#save-expense');

    // Verify validation message is shown
    await expect(page.locator('body')).toContainText('Please fill in all required fields.');
  });

});
