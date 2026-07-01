import { test, expect } from './fixtures/baseFixture.js';
import { seedStorageState } from './helpers/stateInit.js';
import { mockData } from './fixtures/mockData.js';

test.describe('Car Profile & VIN Decoders', () => {

  // Tier 1: Feature Coverage (Happy Path)

  test('1. Manual Profile Creation & Saving', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.fill('div:has(> label:has-text("Make *")) > input', 'Hyundai');
    await page.fill('div:has(> label:has-text("Model *")) > input', 'Solaris');
    await page.fill('div:has(> label:has-text("Year *")) > input', '2019');
    await page.fill('div:has(> label:has-text("Mileage (km) *")) > input', '45000');
    await page.fill('div:has(> label:has-text("Engine")) > input', '1.6 MPI');
    await page.fill('div:has(> label:has-text("Transmission")) > input', 'Automatic');
    await page.click('button#save-profile');

    // Assertions
    await expect(page.locator('body')).toContainText('Hyundai');
    await expect(page.locator('body')).toContainText('Solaris');
    
    // Verify localStorage item exists and contains correct info
    const profileState = await page.evaluate(() => localStorage.getItem('ai_car_profile'));
    expect(profileState).not.toBeNull();
    const profile = JSON.parse(profileState);
    expect(profile.make).toBe('Hyundai');
    expect(profile.model).toBe('Solaris');
    expect(profile.currentMileage).toBe(45000);
  });

  test('2. VIN Decoder - Local RU/CIS Database', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.fill('#vin-input', 'XTA219000H1234567');
    await page.click('button:has-text("Decode VIN")');

    // Assertions
    await expect(page.locator('#make')).toHaveValue('Lada');
    await expect(page.locator('#model')).toHaveValue('Granta');
    await expect(page.locator('#year')).toHaveValue('2017');
  });

  test('3. VIN Decoder - Global NHTSA Simulation', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.fill('#vin-input', '3VW2K7AJ0HM123456');
    await page.click('button:has-text("Decode VIN")');

    // Assertions
    await expect(page.locator('#make')).toHaveValue('Volkswagen');
    await expect(page.locator('#model')).toHaveValue('Jetta');
    await expect(page.locator('#year')).toHaveValue('2017');
  });

  test('4. OCR Simulation - STS Card Upload', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.setInputFiles('#sts-upload', 'tests/e2e/fixtures/assets/sts_card.png');

    // Wait for OCR simulation / analysis
    await page.waitForTimeout(500);
    await expect(page.locator('#vin-input')).toHaveValue('XTA219000H1234567');
  });

  test('5. OCR Simulation - Dashboard Odometer Upload', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.setInputFiles('#odometer-upload', 'tests/e2e/fixtures/assets/odometer_dash.jpg');
    
    // Wait for analysis
    await page.waitForTimeout(500);
    await expect(page.locator('#current-mileage')).toHaveValue('85200');
  });

  // Tier 2: Boundary & Corner Cases

  test('6. Empty Profile Validation', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    // Navigates to Profile, clicks save without typing
    await page.click('button#save-profile');
    
    // Assertions
    await expect(page.locator('body')).toContainText('Please fill in all required fields.');
  });

  test('7. Invalid VIN Format & Length Validation', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    // Length is 10
    await page.fill('#vin-input', 'XTA219000H');
    await page.click('button:has-text("Decode VIN")');
    await expect(page.locator('body')).toContainText('VIN must be exactly 17 characters.');

    // Forbidden char 'O'
    await page.fill('#vin-input', 'XTA219000H123456O');
    await page.click('button:has-text("Decode VIN")');
    await expect(page.locator('body')).toContainText('VIN contains invalid characters (I, O, Q are not allowed).');
  });

  test('8. Extreme Mileage Bounds', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.fill('#make', 'Lada');
    await page.fill('#model', 'Granta');
    await page.fill('#year', '2017');
    await page.fill('#current-mileage', '-200');
    await page.click('button#save-profile');
    await expect(page.locator('body')).toContainText('Mileage must be between 0 and 9,999,999 km');

    await page.fill('#current-mileage', '100000000');
    await page.click('button#save-profile');
    await expect(page.locator('body')).toContainText('Mileage must be between 0 and 9,999,999 km');
  });

  test('9. Future Vehicle Production Year', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.fill('#make', 'Lada');
    await page.fill('#model', 'Granta');
    await page.fill('#year', '2028');
    await page.fill('#current-mileage', '10000');
    await page.click('button#save-profile');
    await expect(page.locator('body')).toContainText('Year cannot be in the future');
  });

  test('10. Corrupt / Invalid File Upload for OCR', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Profile")');
    await page.waitForTimeout(500);
    await page.setInputFiles('#sts-upload', 'tests/e2e/fixtures/assets/dummy.txt');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toContainText('Supported formats: PNG, JPG, JPEG only. Parsing failed.');
  });

});
