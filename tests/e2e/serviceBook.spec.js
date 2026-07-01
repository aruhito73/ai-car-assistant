import { test, expect } from './fixtures/baseFixture.js';
import { seedStorageState } from './helpers/stateInit.js';
import { mockData } from './fixtures/mockData.js';

test.describe('Maintenance & Service Book', () => {

  // Tier 1: Feature Coverage (Happy Path)

  test('11. Add Service Log Entry', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    await page.selectOption('#service-type', { label: 'Oil Change' });
    await page.fill('#odometer', '86000');
    await page.fill('#service-date', '2026-06-28');
    await page.fill('#service-cost', '5000');
    await page.fill('#service-notes', 'Castrol Edge 5W-30');
    await page.click('button[type="submit"], button:has-text("Add Record")');

    // Assertions
    await expect(page.locator('body')).toContainText('Oil Change');
    await expect(page.locator('body')).toContainText('86,000');
    await expect(page.locator('body')).toContainText('5000');
    await expect(page.locator('body')).toContainText('Castrol Edge 5W-30');

    // Verify in localStorage
    const servicesState = await page.evaluate(() => localStorage.getItem('ai_car_services'));
    expect(servicesState).not.toBeNull();
    const services = JSON.parse(servicesState);
    expect(services.some(s => s.notes === 'Castrol Edge 5W-30')).toBe(true);
  });

  test('12. Edit Service Log Entry', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    
    // Locate row with "Suspension Repair" and click edit
    await page.click('button.edit-service-btn, [data-testid="edit-srv-002"]');
    await page.fill('#cost', '14000');
    await page.fill('#notes', 'Replaced with OEM dampers');
    await page.click('button#save-service-record');

    // Assertions
    await expect(page.locator('body')).toContainText('14,000');
    await expect(page.locator('body')).toContainText('Replaced with OEM dampers');
  });

  test('13. Delete Service Log Entry', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    
    // Locate delete button for Suspension Repair and click (no confirmation modal is present)
    await page.locator('div.rounded-xl', { hasText: 'Suspension Repair' }).locator('button[title="Delete log"]').click();

    // Assertions
    await expect(page.locator('body')).not.toContainText('Suspension Repair');
  });

  test('14. Maintenance Grid Verification', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    
    // Check maintenance recommendations
    await expect(page.locator('body')).toContainText('Next Oil Change due at 90,000 km');
  });

  test('15. Add and Toggle Reminders', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    await page.click('#add-reminder-btn');
    await page.fill('#reminder-title', 'OSAGO Renewal');
    await page.fill('#reminder-date', '2027-06-15');
    await page.click('button#save-reminder');

    // Toggle reminder
    await page.click('input[type="checkbox"][data-testid="toggle-rem-001"], [data-testid="toggle-rem-001"]');

    // Assertions
    await expect(page.locator('[data-testid="rem-001"]')).toContainText('Inactive');
  });

  // Tier 2: Boundary & Corner Cases

  test('16. Service Mileage Prior to Previous Records', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    await page.click('#add-service-btn');
    await page.selectOption('#service-type', { label: 'Oil Change' });
    await page.fill('#odometer', '70000'); // Less than current 85,200 km
    await page.fill('#date', '2026-06-28');
    await page.click('button#save-service-record');

    // Assertions
    await expect(page.locator('[data-testid="odometer-warning"]')).toContainText("Mileage entered is less than the vehicle's current mileage");
  });

  test('17. Negative or Extreme Cost Values', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    await page.click('#add-service-btn');
    await page.fill('#cost', '-250');
    await page.click('button#save-service-record');
    await expect(page.locator('body')).toContainText('Cost must be a positive number');

    await page.fill('#cost', '100000000');
    await page.click('button#save-service-record');
    await expect(page.locator('body')).toContainText('Cost must be a positive number');
  });

  test('18. Required Fields Validation', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    await page.click('#add-service-btn');
    await page.click('button#save-service-record');

    // Assertions
    await expect(page.locator('body')).toContainText('Service Type is required');
    await expect(page.locator('body')).toContainText('Service Date is required');
  });

  test('19. Future Date Boundary', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');
    await page.click('#add-service-btn');
    await page.selectOption('#service-type', { label: 'Oil Change' });
    await page.fill('#date', '2035-12-31');
    await page.click('button#save-service-record');

    await expect(page.locator('body')).toContainText('Service date cannot be in the future');
  });

  test('20. Empty State UI', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.evaluate(() => {
      localStorage.setItem('ai_car_services', JSON.stringify([]));
    });
    await page.reload();
    await page.click('button:has-text("Service Book"), a:has-text("Service Book"), #nav-services');

    // Table should be absent and empty state banner visible
    await expect(page.locator('body')).toContainText('No service records registered yet. Fill in the form to register maintenance history.');
  });

});
