import { test, expect } from './fixtures/baseFixture.js';
import { seedStorageState } from './helpers/stateInit.js';
import { mockData } from './fixtures/mockData.js';

test.describe('Tier 3: Cross-Feature Combination Scenarios', () => {

  test('Test 1: VIN Decode ➔ Auto-Matched Parts Catalog ➔ Bookmarks Storage', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // 2. Navigate to Profile page
    await page.click('#nav-profile');
    await page.waitForTimeout(500);

    // 2. Input a valid 17-digit VIN in #vin-input and click "Decode VIN"
    await page.fill('#vin-input', 'XTA219000H1234567');
    await page.click('button:has-text("Decode VIN")');

    // 3. Verify details auto-fill and set mileage to 85200 and click save-profile
    await expect(page.locator('#make')).toHaveValue('Lada');
    await expect(page.locator('#model')).toHaveValue('Granta');
    await expect(page.locator('#year')).toHaveValue('2017');
    await page.fill('#current-mileage', '85200');
    await page.click('#save-profile');

    // Verify it saved successfully and shows static details
    await expect(page.locator('body')).toContainText('Lada Granta');

    // 4. Navigate to Parts page
    await page.click('#nav-parts');
    await page.waitForTimeout(500);

    // 5. Verify the catalog displays auto-matched parts
    await expect(page.locator('body')).toContainText('Oil Filter');
    await expect(page.locator('body')).toContainText('2108-1012005');
    await expect(page.locator('body')).toContainText('Timing Belt Kit');
    await expect(page.locator('body')).toContainText('1987946282');

    // 6. Click the bookmark button on the first part
    await page.click('[data-testid="bookmark-part-0"]');

    // 7. Switch to the "Saved Parts" tab
    await page.click('#saved-parts-tab');
    await expect(page.locator('body')).toContainText('Oil Filter');

    // 8. Perform page navigation instead of reload
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('#nav-parts').waitFor({ state: 'visible' });

    // 9. Verify that "Oil Filter" remains in the saved parts catalog
    await page.click('#nav-parts');
    await page.locator('#saved-parts-tab').waitFor({ state: 'visible' });
    await page.click('#saved-parts-tab');
    await expect(page.locator('body')).toContainText('Oil Filter');
  });

  test('Test 2: Dashboard Odometer OCR Update ➔ Chat Diagnostic Context Sync', async ({ pageWithJettaProfile }) => {
    const page = pageWithJettaProfile;

    // 1. Navigate to Dashboard
    await page.click('#nav-dashboard');
    await page.waitForTimeout(500);

    // 2. Locate file input #odometer-upload and upload mock file
    await page.setInputFiles('#odometer-upload', 'tests/e2e/fixtures/assets/odometer_dash.jpg');
    await page.waitForTimeout(500);

    // 3. Assert Active Vehicle card updates mileage to 85,200 km
    await expect(page.locator('body')).toContainText('85,200 km');

    // 4. Navigate to the AI Mechanic Chat page
    await page.click('#nav-chat');
    await page.waitForTimeout(500);

    // 5. Input and submit message: "How is my engine oil?"
    await page.fill('#chat-message', 'How is my engine oil?');
    await page.click('button:has-text("Send")');

    // 6. Assert chatbot reply references the updated mileage
    await page.waitForTimeout(1000); // bot reply has 800ms timeout
    await expect(page.locator('body')).toContainText('For your 2018 Volkswagen Jetta (85200 km)');
    await expect(page.locator('body')).toContainText('Since your mileage is 85200 km');
  });

  test('Test 3: Service Log Registration ➔ AI Chat History Verification', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;

    // 1. Go to Service Book page
    await page.click('#nav-services');
    await page.waitForTimeout(500);

    // 2. Fill in the "Add Service Record" form
    await page.selectOption('#service-type', { value: 'Oil Change' });
    await page.fill('#odometer', '86000');
    await page.fill('#service-date', '2026-06-28');
    await page.fill('#service-cost', '5000');
    await page.fill('#service-notes', 'Valvoline SynPower 5W-40');
    await page.click('button:has-text("Add Record")');

    // Verify it shows up in Past Records
    await expect(page.locator('body')).toContainText('Valvoline SynPower 5W-40');

    // 3. Navigate to AI Mechanic page
    await page.click('#nav-chat');
    await page.waitForTimeout(500);

    // 4. Send chat message: "Check my service history records"
    await page.fill('#chat-message', 'Check my service history records');
    await page.click('button:has-text("Send")');

    // 5. Assert chatbot reply correctly parses updated logs count (3 logs)
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('You currently have 3 service logs registered');
  });

  test('Test 4: Vehicle Profile Dynamic Swap ➔ Parts Catalog Auto-Rematching', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;

    // 1. Navigate to Parts page and verify Lada Granta parts are loaded
    await page.click('#nav-parts');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toContainText('Timing Belt Kit');
    await expect(page.locator('body')).toContainText('1987946282');

    // 2. Navigate to Profile page
    await page.click('#nav-profile');
    await page.waitForTimeout(500);

    // 3. Click the "Edit Profile" button to open the form
    await page.click('button:has-text("Edit Profile")');
    await page.waitForTimeout(300);

    // 4. Replace with Jetta details
    await page.fill('#make', 'Volkswagen');
    await page.fill('#model', 'Jetta');
    await page.fill('#year', '2018');
    await page.fill('#current-mileage', '62000');
    await page.click('#save-profile');

    // 5. Navigate back to Parts page
    await page.click('#nav-parts');
    await page.waitForTimeout(500);

    // 6. Assert Lada Granta parts are no longer rendered, and Jetta parts are displayed
    await expect(page.locator('body')).not.toContainText('1987946282');
    await expect(page.locator('body')).toContainText('Cabin Air Filter');
    await expect(page.locator('body')).toContainText('5Q0819653');
  });

  test('Test 5: STS Card OCR Import ➔ Profile Save ➔ Custom Part Search Fallback', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;

    // 1. Navigate to Profile page
    await page.click('#nav-profile');
    await page.waitForTimeout(500);

    // 2. Select STS upload input and upload sts_card.png
    await page.setInputFiles('#sts-upload', 'tests/e2e/fixtures/assets/sts_card.png');
    await page.waitForTimeout(500);

    // 3. Assert details populate, input mileage and click Save Profile
    await expect(page.locator('#make')).toHaveValue('Lada');
    await expect(page.locator('#model')).toHaveValue('Granta');
    await page.fill('#current-mileage', '85200');
    await page.click('#save-profile');

    // 4. Navigate to Parts page
    await page.click('#nav-parts');
    await page.waitForTimeout(500);

    // 5. Assert Lada Granta parts populate the catalog
    await expect(page.locator('body')).toContainText('Oil Filter');

    // 6. In parts search, type Jetta cabin air filter OEM and search
    await page.fill('#parts-search', '5Q0819653');
    await page.click('#search-parts-btn');

    // 7. Verify Cabin Air Filter is returned (global parts fallback)
    await expect(page.locator('body')).toContainText('Cabin Air Filter');
  });

});
