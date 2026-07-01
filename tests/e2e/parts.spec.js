import { test, expect } from './fixtures/baseFixture.js';
import { seedStorageState } from './helpers/stateInit.js';
import { mockData } from './fixtures/mockData.js';

test.describe('Parts & Reference', () => {

  // Tier 1: Feature Coverage (Happy Path)

  test('41. OEM Part Number Automatic Matching', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');

    // Assertions
    await expect(page.locator('body')).toContainText('Oil Filter');
    await expect(page.locator('body')).toContainText('2108-1012005');
    await expect(page.locator('body')).toContainText('Timing Belt Kit');
    await expect(page.locator('body')).toContainText('1987946282');
  });

  test('42. Store Search Redirect Links', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');

    const link = page.locator('a[href*="autodoc.ru"]').first();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('href', 'https://autodoc.ru');
  });

  test('43. Custom Part Search', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');
    await page.fill('#part-search-input, #parts-search', '5Q0819653');
    await page.click('button#search-parts-btn, button:has-text("Search")');

    await expect(page.locator('body')).toContainText('Cabin Air Filter');
  });

  test('44. Price Comparison Layout', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');

    // Locate autodoc and exist shop buttons side by side
    const autodocBtn = page.locator('a[href*="autodoc.ru"]').first();
    const existBtn = page.locator('a[href*="exist.ru"]').first();
    await expect(autodocBtn).toBeVisible();
    await expect(existBtn).toBeVisible();
  });

  test('45. Favorite/Bookmark Part', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');
    await page.click('[data-testid="bookmark-part-0"], button.bookmark-btn');

    // Switch to saved parts tab/section
    await page.click('button:has-text("Saved Parts"), #saved-parts-tab');
    await expect(page.locator('body')).toContainText('Oil Filter');
  });

  // Tier 2: Boundary & Corner Cases

  test('46. Search Query Sanitization', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');
    await page.fill('#part-search-input, #parts-search', 'OEM# $%^&*()');
    await page.click('button#search-parts-btn, button:has-text("Search")');

    await expect(page.locator('body')).toContainText('No matching parts found');
  });

  test('47. Missing Store Link Fallback', async ({ pageWithJettaProfile }) => {
    const page = pageWithJettaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');

    // Jetta profile has Cabin Air Filter with autodoc and autostrong but missing exist
    const existBtn = page.locator('a[href*="exist.ru"]').first();
    // It should be either hidden or grayed out
    const isHiddenOrDisabled = await existBtn.isHidden() || await existBtn.getAttribute('aria-disabled') === 'true' || await existBtn.getAttribute('disabled') !== null;
    expect(isHiddenOrDisabled).toBe(true);
  });

  test('48. No Active Vehicle Profile (Empty Parts Tab)', async ({ pageWithEmptyState }) => {
    const page = pageWithEmptyState;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');

    await expect(page.locator('body')).toContainText('Add a vehicle profile first to see auto-matched OEM parts');
  });

  test('49. Extremely Long Text Wrap Handling', async ({ pageWithEmptyState }) => {
    test.slow();
    const page = pageWithEmptyState;
    // Seed custom vehicle with extremely long part name
    const longPartName = 'Very long part name '.repeat(10);
    const customVehicle = {
      make: 'Custom',
      model: 'Vehicle',
      year: 2026,
      parts: [
        { name: longPartName, oem: '1234567890'.repeat(5), shopLinks: {} }
      ]
    };
    await seedStorageState(page, customVehicle, [], [], []);

    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');
    
    // Check it displays and layout doesn't break
    await expect(page.locator('body')).toContainText('Very long part name');
  });

  test('50. Empty Search Query Submission', async ({ pageWithLadaProfile }) => {
    test.slow();
    const page = pageWithLadaProfile;
    await page.click('button:has-text("Parts & Reference"), a:has-text("Parts & Reference"), #nav-parts');
    await page.fill('#part-search-input, #parts-search', 'Oil Filter');
    await page.click('button#search-parts-btn, button:has-text("Search")');
    await expect(page.locator('body')).not.toContainText('Timing Belt Kit');

    // Submit empty search query
    await page.fill('#part-search-input, #parts-search', '');
    await page.click('button#search-parts-btn, button:has-text("Search")');

    // Should reset and show all parts
    await expect(page.locator('body')).toContainText('Timing Belt Kit');
  });

});
