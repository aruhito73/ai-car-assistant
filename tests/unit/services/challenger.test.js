import { describe, test, expect } from 'vitest';
import { decodeVin, generateShopLinks } from '../../../src/services/vinService.js';
import { recognizeSTS, recognizeDashboard } from '../../../src/services/ocrService.js';
import { 
  getPartsForVehicle, 
  searchParts, 
  getPartShopLinks, 
  sanitizeSearchQuery,
  generateShopLink 
} from '../../../src/services/partsService.js';

describe('Challenger 5 - Robustness, Stress, and Boundary Tests', () => {

  describe('vinService.js - Robustness & Specific Cases', () => {
    
    // 1. Boundary tests for wrong length, invalid characters, empty strings, case sensitivity
    test('VIN Decoding - Empty strings and invalid formats', async () => {
      await expect(decodeVin('')).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin('   ')).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin(null)).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin(undefined)).rejects.toThrow('VIN must be exactly 17 characters.');
    });

    test('VIN Decoding - Extreme values and wrong lengths', async () => {
      // Too short
      await expect(decodeVin('XTA219000H')).rejects.toThrow('VIN must be exactly 17 characters.');
      // Too long
      await expect(decodeVin('XTA219000H123456789')).rejects.toThrow('VIN must be exactly 17 characters.');
      // 17 characters with leading/trailing spaces resulting in shorter trimmed string
      await expect(decodeVin(' XTA219000H12345 ')).rejects.toThrow('VIN must be exactly 17 characters.');
    });

    test('VIN Decoding - Invalid characters (I, O, Q, special characters)', async () => {
      // Forbidden characters I, O, Q
      await expect(decodeVin('XTA219000H123456I')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      await expect(decodeVin('XTA219000H123456O')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      await expect(decodeVin('XTA219000H123456Q')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      
      // Special characters
      await expect(decodeVin('XTA219000H123456*')).rejects.toThrow('VIN contains invalid characters.');
      await expect(decodeVin('XTA219000H123456-')).rejects.toThrow('VIN contains invalid characters.');
      await expect(decodeVin('XTA219000H123456_')).rejects.toThrow('VIN contains invalid characters.');
      // Space in middle (makes it trimmed length 17, but invalid characters inside)
      await expect(decodeVin('XTA219000 H123456')).rejects.toThrow('VIN contains invalid characters.');
      // Space at the end (trimmed length 16)
      await expect(decodeVin('XTA219000H123456 ')).rejects.toThrow('VIN must be exactly 17 characters.');
    });

    test('VIN Decoding - Case sensitivity and normalization', async () => {
      // Lowercase valid VIN should be normalized and parsed correctly
      const lowercaseGranta = await decodeVin('xta219000h1234567');
      expect(lowercaseGranta.make).toBe('Lada');
      expect(lowercaseGranta.model).toBe('Granta');
      expect(lowercaseGranta.transmission).toBe('Manual');

      const lowercaseVesta = await decodeVin('xta218000h1234567');
      expect(lowercaseVesta.make).toBe('Lada');
      expect(lowercaseVesta.model).toBe('Vesta');
      expect(lowercaseVesta.transmission).toBe('Manual');
    });

    // 2. Lada automatic/manual transmission decoding tests
    test('VIN Decoding - Lada automatic transmission cases', async () => {
      // XTA229000H1234567 (Granta, position 5 is '2' which is auto)
      const grantaAuto1 = await decodeVin('XTA229000H1234567');
      expect(grantaAuto1.make).toBe('Lada');
      expect(grantaAuto1.model).toBe('Granta');
      expect(grantaAuto1.transmission).toBe('Automatic');

      // XTA249000H1234567 (Granta, position 5 is '4' which is auto)
      const grantaAuto2 = await decodeVin('XTA249000H1234567');
      expect(grantaAuto2.make).toBe('Lada');
      expect(grantaAuto2.model).toBe('Granta');
      expect(grantaAuto2.transmission).toBe('Automatic');

      // XTA228000H1234567 (Vesta, position 5 is '2' which is auto)
      const vestaAuto1 = await decodeVin('XTA228000H1234567');
      expect(vestaAuto1.make).toBe('Lada');
      expect(vestaAuto1.model).toBe('Vesta');
      expect(vestaAuto1.transmission).toBe('Automatic');

      // XTA248000H1234567 (Vesta, position 5 is '4' which is auto)
      const vestaAuto2 = await decodeVin('XTA248000H1234567');
      expect(vestaAuto2.make).toBe('Lada');
      expect(vestaAuto2.model).toBe('Vesta');
      expect(vestaAuto2.transmission).toBe('Automatic');
    });

    test('VIN Decoding - Lada manual transmission cases', async () => {
      // XTA219000H1234567 (Granta, position 5 is '1' which is manual)
      const grantaManual = await decodeVin('XTA219000H1234567');
      expect(grantaManual.make).toBe('Lada');
      expect(grantaManual.model).toBe('Granta');
      expect(grantaManual.transmission).toBe('Manual');

      // XTA238000H1234567 (Vesta, position 5 is '3' which is manual)
      const vestaManual = await decodeVin('XTA238000H1234567');
      expect(vestaManual.make).toBe('Lada');
      expect(vestaManual.model).toBe('Vesta');
      expect(vestaManual.transmission).toBe('Manual');

      // XTA258000H1234567 (Vesta, position 5 is '5' which is manual)
      const vestaManual5 = await decodeVin('XTA258000H1234567');
      expect(vestaManual5.transmission).toBe('Manual');
    });

    // 3. Fuzzing with random inputs
    test('VIN Decoding - Fuzz testing', async () => {
      const generateRandomString = (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!@#$%^&*() ') => {
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      for (let i = 0; i < 500; i++) {
        const length = Math.floor(Math.random() * 30);
        const fuzzed = generateRandomString(length);
        try {
          const res = await decodeVin(fuzzed);
          // If succeeds, it must be exactly 17 valid alphanumeric characters, and verify fields
          expect(fuzzed.trim().length).toBe(17);
          expect(res).toHaveProperty('make');
          expect(res).toHaveProperty('model');
          expect(res).toHaveProperty('transmission');
        } catch (err) {
          expect([
            'VIN must be exactly 17 characters.',
            'VIN contains invalid characters (I, O, Q are not allowed).',
            'VIN contains invalid characters.'
          ]).toContain(err.message);
        }
      }
    });

  });

  describe('ocrService.js - Path False Positive Prevention', () => {

    test('recognizeSTS - False positive prevention for paths containing "tests"', async () => {
      // Path containing "tests" but not "sts" in the filename should be rejected
      await expect(recognizeSTS('C:\\tests\\dummy.png')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
      await expect(recognizeSTS('/usr/local/tests/odometer.png')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
      await expect(recognizeSTS('/tests/another_image.jpg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    test('recognizeSTS - Successful matches on valid files in paths containing "tests"', async () => {
      // Path containing "tests" AND "sts" in the filename should succeed
      const res1 = await recognizeSTS('C:\\tests\\sts_card.png');
      expect(res1).toEqual({ vin: 'XTA219000H1234567' });

      const res2 = await recognizeSTS('/tests/sts_card.png');
      expect(res2).toEqual({ vin: 'XTA219000H1234567' });

      const res3 = await recognizeSTS('tests/sts_card.png');
      expect(res3).toEqual({ vin: 'XTA219000H1234567' });

      // Path containing "tests" AND a valid 17-char VIN in the filename should succeed
      const res4 = await recognizeSTS('C:\\tests\\my_car_3VW2K7AJ0HM123456.jpg');
      expect(res4).toEqual({ vin: '3VW2K7AJ0HM123456' });
    });

    test('recognizeDashboard - False positive prevention and valid matches', async () => {
      // Path containing "tests" but not "odometer" in filename
      await expect(recognizeDashboard('C:\\tests\\sts_card.png')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );

      // Path containing "tests" and "odometer" in filename
      const res = await recognizeDashboard('C:\\tests\\odometer_dash.jpg');
      expect(res).toEqual({ mileage: 85200 });

      // Path containing "tests" and mileage digits in filename
      const resDigits = await recognizeDashboard('C:\\tests\\dash_12345.png');
      expect(resDigits).toEqual({ mileage: 12345 });
    });

    test('OCR Services - Boundary inputs and unexpected types', async () => {
      // Empty values
      await expect(recognizeSTS(null)).rejects.toThrow('Supported formats: PNG, JPG, JPEG only. Parsing failed.');
      await expect(recognizeSTS(undefined)).rejects.toThrow('Supported formats: PNG, JPG, JPEG only. Parsing failed.');
      await expect(recognizeSTS('')).rejects.toThrow('Supported formats: PNG, JPG, JPEG only. Parsing failed.');
      
      // Unsupported extensions
      await expect(recognizeSTS('C:\\tests\\sts_card.gif')).rejects.toThrow('Supported formats: PNG, JPG, JPEG only. Parsing failed.');
      await expect(recognizeSTS('C:\\tests\\sts_card.txt')).rejects.toThrow('Supported formats: PNG, JPG, JPEG only. Parsing failed.');
      await expect(recognizeSTS('C:\\tests\\sts_card.pdf')).rejects.toThrow('Supported formats: PNG, JPG, JPEG only. Parsing failed.');

      // Unexpected types
      await expect(recognizeSTS(12345)).rejects.toThrow();
      await expect(recognizeSTS({})).rejects.toThrow();
      await expect(recognizeSTS({ name: 12345 })).rejects.toThrow();
      await expect(recognizeSTS({ name: '' })).rejects.toThrow();
      await expect(recognizeSTS({ name: 'sts_card.png', type: 'image/png' })).resolves.toEqual({ vin: 'XTA219000H1234567' });
    });

  });

  describe('partsService.js - Robustness and Boundary Cases', () => {

    test('getPartsForVehicle - unexpected object types and extreme inputs', () => {
      // Null and undefined
      expect(getPartsForVehicle(null)).toEqual([]);
      expect(getPartsForVehicle(undefined)).toEqual([]);

      // Invalid property types
      expect(getPartsForVehicle({ make: 123, model: 'Granta' })).toEqual([]);
      expect(getPartsForVehicle({ make: 'Lada', model: {} })).toEqual([]);
      expect(getPartsForVehicle({ make: [], model: 12.34 })).toEqual([]);

      // Extreme values (very long strings)
      const longMake = 'A'.repeat(5000);
      const longModel = 'B'.repeat(5000);
      const longEngine = 'C'.repeat(5000);
      const parts = getPartsForVehicle({ make: longMake, model: longModel, engine: longEngine });
      expect(parts.length).toBe(5);
      expect(parts[0].oem).toContain('AAA-');
    });

    test('searchParts - edge cases and boundary queries', () => {
      const sampleParts = [
        { name: 'Oil Filter', oem: '2108-1012005' },
        { name: 'Air Filter', oem: '2112-1109080' }
      ];

      // Empty and falsy queries
      expect(searchParts(sampleParts, '')).toEqual(sampleParts);
      expect(searchParts(sampleParts, null)).toEqual(sampleParts);
      expect(searchParts(sampleParts, undefined)).toEqual(sampleParts);

      // Sanitization matching
      expect(searchParts(sampleParts, '2108')).toEqual([{ name: 'Oil Filter', oem: '2108-1012005' }]);
      expect(searchParts(sampleParts, '  2108-1012005  ')).toEqual([{ name: 'Oil Filter', oem: '2108-1012005' }]);
      expect(searchParts(sampleParts, 'Oil#$&*')).toEqual([{ name: 'Oil Filter', oem: '2108-1012005' }]);
      
      // Query that completely sanitizes to empty
      expect(searchParts(sampleParts, '!@#$%^&*()_+')).toEqual([]);

      // Non-string queries
      expect(searchParts(sampleParts, 2108)).toEqual([{ name: 'Oil Filter', oem: '2108-1012005' }]);
      expect(searchParts(sampleParts, { oem: '2108' })).toEqual([]);
    });

    test('generateShopLink - boundary inputs', () => {
      expect(generateShopLink('autodoc', null)).toBeNull();
      expect(generateShopLink('autodoc', undefined)).toBeNull();
      expect(generateShopLink('autodoc', '')).toBeNull();
      expect(generateShopLink('unknown-shop', '123')).toBeNull();

      // Special characters in oem should be URL encoded
      const specOem = '2108/1012005?x=y';
      const link = generateShopLink('autodoc', specOem);
      expect(link).toBe(`https://www.autodoc.ru/price/all/${encodeURIComponent(specOem)}`);
    });

  });

});
