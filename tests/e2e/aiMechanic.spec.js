import { test, expect } from './fixtures/baseFixture.js';
import { seedStorageState } from './helpers/stateInit.js';
import { mockData } from './fixtures/mockData.js';

test.describe('AI Mechanic & Diagnostics', () => {

  // Happy Path (Feature Coverage)

  test('31. Interactive Diagnostic Chat', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    await page.fill('#chat-message', 'How to check engine oil?');
    await page.click('button:has-text("Send"), button[type="submit"]');

    // Assertions
    await expect(page.locator('body')).toContainText('How to check engine oil?');
    await expect(page.locator('body')).toContainText('I am your AI Mechanic');
  });

  test('32. OBD-2 Fault Code Dictionary Lookup', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    
    // Switch to OBD tab if applicable
    await page.click('button:has-text("OBD-2 Codes"), #obd-tab');
    await page.fill('#obd-code-input, #obd-input', 'P0300');
    await page.click('button#search-obd-btn, button:has-text("Lookup Code")');

    // Assertions
    await expect(page.locator('body')).toContainText('Random/Multiple Cylinder Misfire Detected');
    await expect(page.locator('body')).toContainText('worn spark plugs');
  });

  test('33. Acoustic Noise Analysis - Engine Knock', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    
    // Switch to Acoustic tab if applicable
    await page.click('button:has-text("Acoustic Diagnosis"), #acoustic-tab');
    await page.setInputFiles('#audio-upload, input[type="file"][data-testid="audio-uploader"]', 'tests/e2e/fixtures/assets/engine_knock.mp3');
    await page.click('button#analyze-audio-btn, button:has-text("Analyze Sound")');

    // Assertions
    await expect(page.locator('body')).toContainText('Severe rod knock / engine bearing wear detected.');
    await expect(page.locator('body')).toContainText('0.92');
  });

  test('34. Acoustic Noise Analysis - Serpentine Belt Squeal', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    
    // Switch to Acoustic tab if applicable
    await page.click('button:has-text("Acoustic Diagnosis"), #acoustic-tab');
    await page.setInputFiles('#audio-upload, input[type="file"][data-testid="audio-uploader"]', 'tests/e2e/fixtures/assets/belt_squeal.wav');
    await page.click('button#analyze-audio-btn, button:has-text("Analyze Sound")');

    // Assertions
    await expect(page.locator('body')).toContainText('Serpentine accessory drive belt slipping');
    await expect(page.locator('body')).toContainText('0.85');
  });

  test('35. Car Sale Copilot Ad Generation', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    
    // Switch to Sale Copilot tab
    await page.click('button:has-text("Sale Copilot"), #copilot-tab');
    await page.click('button#generate-ad-btn, button:has-text("Generate Ad")');

    // Assertions
    await expect(page.locator('body')).toContainText('2017 Lada Granta');
    await expect(page.locator('body')).toContainText('Manual transmission');
  });

  // Tier 2: Boundary & Corner Cases

  test('36. Invalid OBD-2 Code Search', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    await page.click('button:has-text("OBD-2 Codes"), #obd-tab');
    
    await page.fill('#obd-code-input, #obd-input', 'P9999');
    await page.click('button#search-obd-btn, button:has-text("Lookup Code")');
    await expect(page.locator('body')).toContainText('Unknown fault code. Please check code format');
  });

  test('37. Acoustic Inconclusive Audio Response', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    await page.click('button:has-text("Acoustic Diagnosis"), #acoustic-tab');
    await page.setInputFiles('#audio-upload, input[type="file"][data-testid="audio-uploader"]', 'tests/e2e/fixtures/assets/unknown_noise.mp3');
    await page.click('button#analyze-audio-btn, button:has-text("Analyze Sound")');

    await expect(page.locator('body')).toContainText('Acoustic sample inconclusive');
  });

  test('38. Acoustic File Format Validation', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    await page.click('button:has-text("Acoustic Diagnosis"), #acoustic-tab');
    await page.setInputFiles('#audio-upload, input[type="file"][data-testid="audio-uploader"]', 'tests/e2e/fixtures/assets/dummy.txt');

    await expect(page.locator('body')).toContainText('Supported audio formats: MP3, WAV, M4A only');
  });

  test('39. Empty Chat Submission', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    await page.fill('#chat-message', '   ');
    await page.click('button:has-text("Send"), button[type="submit"]');

    // No empty messages added (check that the chat container only has 1 message - the initial bot response)
    const chatBubbles = page.locator('div.flex.justify-start, div.flex.justify-end');
    await expect(chatBubbles).toHaveCount(1);
  });

  test('40. Ad Generator with Empty Vehicle Profile', async ({ pageWithLadaProfile }) => {
    const page = pageWithLadaProfile;
    await page.evaluate(() => {
      localStorage.setItem('ai_car_profile', JSON.stringify({ make: '', model: '' }));
    });
    await page.reload();
    await page.click('button:has-text("AI Mechanic"), a:has-text("AI Mechanic"), #nav-chat');
    await page.click('button:has-text("Sale Copilot"), #copilot-tab');

    await expect(page.locator('body')).toContainText('Please create a vehicle profile first to generate a sales ad');
  });

});
