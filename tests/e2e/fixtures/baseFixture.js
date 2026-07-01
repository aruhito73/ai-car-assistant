import { test as base } from '@playwright/test';
import { mockData } from './mockData';
import { seedStorageState } from '../helpers/stateInit';

export const test = base.extend({
  // Custom page fixture to override page.click for mobile sidebar automatic opening
  page: async ({ page }, use) => {
    const originalClick = page.click.bind(page);
    page.click = async (selector, options) => {
      let isNav = false;
      if (typeof selector === 'string') {
        const keywords = ['AI Mechanic', 'Profile', 'Service Book', 'Finance', 'Dashboard', 'Parts & Reference', '#nav-', 'nav-'];
        isNav = keywords.some(keyword => selector.includes(keyword)) && 
                !selector.toLowerCase().includes('save') && 
                !selector.toLowerCase().includes('submit') && 
                !selector.toLowerCase().includes('delete') && 
                !selector.toLowerCase().includes('edit') &&
                !selector.toLowerCase().includes('search') &&
                !selector.toLowerCase().includes('btn') &&
                !selector.toLowerCase().includes('input');
      }
      
      if (isNav) {
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width < 768;
        if (isMobile) {
          const sidebar = page.locator('aside').first();
          if (await sidebar.count() > 0) {
            const classes = await sidebar.getAttribute('class');
            if (classes && classes.includes('-translate-x-full')) {
              const hamburger = page.locator('header button.md\\:hidden').first();
              if (await hamburger.count() > 0) {
                await hamburger.click();
                await page.waitForTimeout(500);
              }
            }
          }
        }
        const result = await originalClick(selector, options);
        await page.waitForTimeout(500);
        return result;
      }
      return originalClick(selector, options);
    };
    await use(page);
  },

  // A page pre-seeded with a Lada Granta profile, service history, expenses, and reminders
  pageWithLadaProfile: async ({ page }, use) => {
    await seedStorageState(
      page,
      mockData.vehicles.ladaGranta,
      mockData.serviceHistories.standard,
      mockData.expenses,
      mockData.reminders
    );
    await use(page);
  },

  // A page pre-seeded with a VW Jetta profile and standard histories
  pageWithJettaProfile: async ({ page }, use) => {
    await seedStorageState(
      page,
      mockData.vehicles.vwJetta,
      mockData.serviceHistories.standard,
      mockData.expenses,
      mockData.reminders
    );
    await use(page);
  },

  // A page starting with completely empty localStorage
  pageWithEmptyState: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
      } catch (e) {
        // Ignore SecurityError
      }
    });
    await page.goto('/?r=' + Math.random(), { waitUntil: 'domcontentloaded' });
    await use(page);
  }
});

export { expect } from '@playwright/test';
