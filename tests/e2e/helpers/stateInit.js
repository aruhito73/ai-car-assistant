/**
 * Pre-populates the local storage with mock states before React app initialization.
 */
export async function seedStorageState(page, carProfile, serviceHistory = [], expenses = [], reminders = []) {
  const state = {
    car: carProfile,
    serviceHistory,
    expenses,
    reminders
  };

  if (page.url() === 'about:blank') {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  await page.evaluate((data) => {
    try {
      // Seed individual keys
      if (data.car) {
        window.localStorage.setItem('ai_car_profile', JSON.stringify(data.car));
      } else {
        window.localStorage.removeItem('ai_car_profile');
      }
      
      window.localStorage.setItem('ai_car_services', JSON.stringify(data.serviceHistory));
      window.localStorage.setItem('ai_car_expenses', JSON.stringify(data.expenses));
      window.localStorage.setItem('ai_car_reminders', JSON.stringify(data.reminders));

      // Also seed combined state key for alternative implementations
      window.localStorage.setItem('ai-car-state', JSON.stringify(data));
    } catch (e) {
      // Ignore SecurityError
    }
  }, state);

  await page.goto('/?r=' + Math.random(), { waitUntil: 'domcontentloaded' });
}

/**
 * Clears the storage state in browser context.
 */
export async function clearStorageState(page) {
  if (page.url() === 'about:blank') {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
    } catch (e) {
      // Ignore SecurityError
    }
  });
  await page.goto('/?r=' + Math.random(), { waitUntil: 'domcontentloaded' });
}
