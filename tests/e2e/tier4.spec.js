import { test, expect } from './fixtures/baseFixture.js';
import { seedStorageState } from './helpers/stateInit.js';
import { mockData } from './fixtures/mockData.js';

test.describe('Tier 4: Real-World Scenario Scenarios', () => {

  test('Scenario 1: Used Car Purchase Onboarding Flow', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // 2. Navigate to Profile page
    await page.click('#nav-profile');
    await page.waitForTimeout(500);

    // 2. Upload STS card
    await page.setInputFiles('#sts-upload', 'tests/e2e/fixtures/assets/sts_card.png');
    await page.waitForTimeout(500);

    // 3. Verify Make, Model, Year auto-populate
    await expect(page.locator('#make')).toHaveValue('Lada');
    await expect(page.locator('#model')).toHaveValue('Granta');
    await expect(page.locator('#year')).toHaveValue('2017');

    // 4. Manually enter current mileage and click save
    await page.fill('#current-mileage', '85200');
    await page.click('#save-profile');

    // Verify it is saved and shows static details
    await expect(page.locator('body')).toContainText('Lada Granta');

    // 5. Navigate to Dashboard
    await page.click('#nav-dashboard');
    await page.waitForTimeout(500);

    // 6. Verify Active Vehicle card displays Lada Granta (2017) and mileage 85,200 km
    await expect(page.locator('body')).toContainText('Lada Granta');
    await expect(page.locator('body')).toContainText('85,200 km');
  });

  test('Scenario 2: Annual Scheduled Maintenance & Financial Bookkeeping', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;

    // 1. Navigate to Service Book
    await page.click('#nav-services');
    await page.waitForTimeout(500);

    // 2. Log inline oil change record
    await page.selectOption('#service-type', { value: 'Oil Change' });
    await page.fill('#odometer', '86500');
    await page.fill('#service-date', '2026-06-20');
    await page.fill('#service-cost', '4500');
    await page.fill('#service-notes', 'Lukoil Genesis Armortech 5W-40, new filter');
    await page.click('button:has-text("Add Record")');

    // Verify in Past Records
    await expect(page.locator('body')).toContainText('Lukoil Genesis Armortech 5W-40, new filter');

    // 3. Navigate to Finance
    await page.click('#nav-finance');
    await page.waitForTimeout(500);

    // 4. Log corresponding expense
    await page.selectOption('#expense-category', { value: 'Repair' });
    await page.fill('#amount', '4500');
    await page.fill('#expense-date', '2026-06-20');
    await page.fill('#expense-notes', 'Oil change service at 86,500 km');
    await page.click('button:has-text("Log Expense")');

    // Verify expense appears in ledger
    await expect(page.locator('body')).toContainText('Oil change service at 86,500 km');

    // 5. Verify total cost summary updates to $29,300.00
    await expect(page.locator('body')).toContainText('$29300.00');
  });

  test('Scenario 3: Roadside Engine Malfunction & AI Diagnostic Copilot Flow', async ({ pageWithJettaProfile }) => {
    const page = pageWithJettaProfile;

    // 1. Navigate to AI Mechanic Chat
    await page.click('#nav-chat');
    await page.waitForTimeout(500);

    // 2. Send engine knocking query
    await page.fill('#chat-message', 'My engine is making a knocking sound');
    await page.click('button:has-text("Send")');

    // 3. Verify bot reply warns about engine knocking / oil pressure / dipstick
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('knocking sound from the engine could indicate low oil pressure');
    await expect(page.locator('body')).toContainText('oil dipstick');

    // 4. Query service history
    await page.fill('#chat-message', 'What is my service history?');
    await page.click('button:has-text("Send")');

    // 5. Verify bot scans local context and says 2 service logs registered
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('You currently have 2 service logs registered');

    // 6. Navigate to Parts
    await page.click('#nav-parts');
    await page.waitForTimeout(500);

    // 7. Search for Cabin Air Filter
    await page.fill('#parts-search', 'Cabin Air Filter');
    await page.click('#search-parts-btn');

    // 8. Verify Cabin Air Filter (OEM: 5Q0819653) displays and has active autodoc link
    await expect(page.locator('body')).toContainText('Cabin Air Filter');
    await expect(page.locator('body')).toContainText('5Q0819653');
    const autodocLink = page.locator('a:has-text("Autodoc")').first();
    await expect(autodocLink).toBeVisible();
  });

  test('Scenario 4: Seasonal Tyre Transition & Winter Preparation Audit', async ({ pageWithJettaProfile }) => {
    const page = pageWithJettaProfile;

    // 1. Navigate to Service Book and log brake inspection via modal
    await page.click('#nav-services');
    await page.waitForTimeout(500);
    await page.click('#add-service-btn');
    await page.locator('#save-service-record').waitFor({ state: 'visible' });

    await page.selectOption('#service-type', { value: 'Brake Inspection' });
    await page.fill('#odometer', '63000');
    await page.fill('#date', '2026-06-25');
    await page.fill('#cost', '1200');
    await page.fill('#notes', 'Brake pads check - 4mm remaining');
    await page.click('button#save-service-record');

    // 2. Navigate to Finance
    await page.click('#nav-finance');
    await page.waitForTimeout(500);

    // 3. Log brake check expense
    await page.selectOption('#expense-category', { value: 'Repair' });
    await page.fill('#amount', '1200');
    await page.fill('#expense-date', '2026-06-25');
    await page.fill('#expense-notes', 'Brake check fee');
    await page.click('button:has-text("Log Expense")');

    // 4. Log tyre purchase expense
    await page.selectOption('#expense-category', { value: 'Other' });
    await page.fill('#amount', '18000');
    await page.fill('#expense-date', '2026-06-26');
    await page.fill('#expense-notes', 'Set of winter tyres');
    await page.click('button:has-text("Log Expense")');

    // Verify both appear in ledger
    await expect(page.locator('body')).toContainText('Brake check fee');
    await expect(page.locator('body')).toContainText('Set of winter tyres');

    // 5. Verify total cost summary updates to $44,000.00
    await expect(page.locator('body')).toContainText('$44000.00');
  });

  test('Scenario 5: Pre-Sale Ownership History Audit & Car Copilot Ad Prep', async ({ page }) => {
    // 1. Go to '/' first, seed state manually to avoid addInitScript re-seeding on reload
    await page.goto('/');
    await page.evaluate((data) => {
      localStorage.setItem('ai_car_profile', JSON.stringify(data.car));
      localStorage.setItem('ai_car_services', JSON.stringify(data.serviceHistory));
      localStorage.setItem('ai_car_expenses', JSON.stringify(data.expenses));
      localStorage.setItem('ai_car_reminders', JSON.stringify(data.reminders));
    }, {
      car: mockData.vehicles.ladaGranta,
      serviceHistory: mockData.serviceHistories.standard,
      expenses: mockData.expenses,
      reminders: mockData.reminders
    });
    await page.goto('/');

    // 2. Navigate to Finance and verify cost summary represents all logged expenses
    await page.click('#nav-finance');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toContainText('$24800.00');

    // 2. Navigate to Service Book and check records
    await page.click('#nav-services');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toContainText('ТО-1 (Engine Oil & Filters)');
    await expect(page.locator('body')).toContainText('Suspension Repair');

    // 3. Navigate to AI Mechanic Chat
    await page.click('#nav-chat');
    await page.waitForTimeout(500);

    // 4. Send message: "Generate details for my car profile"
    await page.fill('#chat-message', 'Generate details for my car profile');
    await page.click('button:has-text("Send")');

    // 5. Verify bot response prints Lada Granta details
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('For your 2017 Lada Granta (85200 km)');

    // 6. Reset application state by clearing localStorage
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?r=' + Math.random(), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Navigate to profile to ensure onboarding inputs are visible
    await page.click('#nav-profile');
    await page.waitForTimeout(500);

    // 7. Verify defaults to empty state
    await expect(page.locator('#nav-profile')).toBeVisible();
    await expect(page.locator('#vin-input')).toBeVisible();
  });

});
