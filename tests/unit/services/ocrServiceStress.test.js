import { describe, it, expect } from 'vitest';
import { recognizeDashboard, recognizeSTS } from '../../../src/services/ocrService.js';

describe('OCR Mileage Parser Stress and Adversarial Tests', () => {

  describe('recognizeDashboard - Mileage extraction edge cases', () => {
    
    it('handles multiple numbers in filename (e.g. year and mileage)', async () => {
      // In a real OCR context, we want to extract the mileage (usually larger or specifically placed).
      // Let's check what the current regex actually extracts.
      // Filename: odometer_2023_85200.jpg
      const result = await recognizeDashboard('odometer_2023_85200.jpg');
      
      // If the current implementation extracts the first match (2023), it's a limitation/bug.
      // Let's assert what the implementation actually does to document the behavior.
      expect(result.mileage).toBe(2023);
    });

    it('fails to extract mileage when adjacent to unit letters (e.g., 85200km)', async () => {
      // Filename: odometer_85200km.jpg
      // Because 'k' is a word char, the lookahead \b fails.
      // So it will fall back to the filename containing 'odometer' standard check, which returns 85200.
      const result = await recognizeDashboard('odometer_85200km.jpg');
      expect(result.mileage).toBe(85200); // Passes due to fallback!
      
      // But what if 'odometer' is not in the filename?
      // Filename: 85200km.jpg
      // It has no 'odometer', so the fallback fails and it should reject.
      await expect(recognizeDashboard('85200km.jpg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('fails on decimal/comma formatted mileage due to boundary constraints', async () => {
      // Filename: odometer_85,200.jpg
      // Matches '85' first, because ',' acts as a non-word boundary.
      const result1 = await recognizeDashboard('odometer_85,200.jpg');
      expect(result1.mileage).toBe(85);

      // Filename: odometer_85.200.jpg
      // Matches '85' first, because '.' acts as a non-word boundary.
      const result2 = await recognizeDashboard('odometer_85.200.jpg');
      expect(result2.mileage).toBe(85);
    });

    it('fails to match 8-digit mileage using the regex', async () => {
      // Filename: odometer_12345678.jpg
      // 8 digits exceeds \d{1,7}, so it fails to match the regex.
      // Falls back to odometer check -> returns 85200.
      const result = await recognizeDashboard('odometer_12345678.jpg');
      expect(result.mileage).toBe(85200);

      // If 'odometer' is not in the filename, it rejects.
      await expect(recognizeDashboard('12345678.jpg')).rejects.toThrow();
    });

    it('successfully extracts maximum allowed 7-digit mileage', async () => {
      const result = await recognizeDashboard('odometer_9999999.jpg');
      expect(result.mileage).toBe(9999999);
    });
  });

  describe('recognizeSTS - VIN extraction edge cases', () => {
    it('extracts valid 17-character VIN even with mixed case and leading/trailing noise', async () => {
      const result = await recognizeSTS('sts_mycar_xta219000h1234567_doc.png');
      expect(result.vin).toBe('XTA219000H1234567');
    });

    it('rejects if 17-character string contains invalid chars like I, O, Q', async () => {
      // If the 17-character string has 'I', the match /[A-HJ-NPR-Z0-9]{17}/i will NOT match it.
      // Thus, it will fall back to the standard check.
      // Filename: sts_xta219000h123456i.png
      // Falls back to includes('sts') -> XTA219000H1234567
      const result = await recognizeSTS('sts_xta219000h123456i.png');
      expect(result.vin).toBe('XTA219000H1234567');

      // Without 'sts' in the filename, it should reject
      await expect(recognizeSTS('xta219000h123456i.png')).rejects.toThrow();
    });
  });
});
