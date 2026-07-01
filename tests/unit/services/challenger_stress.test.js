import { describe, test, it, expect } from 'vitest';
import { decodeVin, generateShopLinks } from '../../../src/services/vinService.js';
import { recognizeSTS, recognizeDashboard } from '../../../src/services/ocrService.js';
import { 
  getPartsForVehicle, 
  searchParts, 
  getPartShopLinks, 
  sanitizeSearchQuery,
  generateShopLink 
} from '../../../src/services/partsService.js';

describe('Challenger 6 Empirical & Stress Verification Tests', () => {

  describe('vinService.js - Lada Transmission Case & Case-Sensitivity Checks', () => {
    test('Verify Lada Granta automatic transmission (XTA229000H1234567)', async () => {
      const result = await decodeVin('XTA229000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.transmission).toBe('Automatic');
      expect(result.year).toBe(2017);
    });

    test('Verify Lada Vesta automatic transmission (XTA228000H1234567)', async () => {
      const result = await decodeVin('XTA228000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Vesta');
      expect(result.transmission).toBe('Automatic');
      expect(result.year).toBe(2017);
    });

    test('Verify Lada Granta automatic transmission via position 5 character 4 (XTA249000H1234567)', async () => {
      const result = await decodeVin('XTA249000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.transmission).toBe('Automatic');
    });

    test('Verify Lada Vesta automatic transmission via position 5 character 4 (XTA248000H1234567)', async () => {
      const result = await decodeVin('XTA248000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Vesta');
      expect(result.transmission).toBe('Automatic');
    });

    test('Verify Lada Granta manual transmission (XTA219000H1234567)', async () => {
      const result = await decodeVin('XTA219000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.transmission).toBe('Manual');
    });

    test('Verify Lada Vesta manual transmission (XTA218000H1234567)', async () => {
      const result = await decodeVin('XTA218000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Vesta');
      expect(result.transmission).toBe('Manual');
    });

    test('Verify Lada Granta other index 4 option (XTA239000H1234567) is Manual', async () => {
      const result = await decodeVin('XTA239000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.transmission).toBe('Manual');
    });

    test('Verify Lada other models fallback (XTA227000H1234567) - falls back to Generic Import', async () => {
      const result = await decodeVin('XTA227000H1234567');
      expect(result.make).toBe('Generic');
      expect(result.model).toBe('Import');
      expect(result.transmission).toBe('Automatic');
    });

    test('Verify case insensitivity of WMI and other characters', async () => {
      const result = await decodeVin('xta229000h1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.transmission).toBe('Automatic');
      expect(result.year).toBe(2017);
    });

    test('Verify VIN parsing with surrounding spaces', async () => {
      const result = await decodeVin('  XTA229000H1234567  ');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.transmission).toBe('Automatic');
    });
  });

  describe('vinService.js - Boundary & Stress Testing', () => {
    test('VIN length boundaries', async () => {
      await expect(decodeVin('')).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin('XTA229000H123456')).rejects.toThrow('VIN must be exactly 17 characters.'); // 16
      await expect(decodeVin('XTA229000H12345678')).rejects.toThrow('VIN must be exactly 17 characters.'); // 18
    });

    test('VIN invalid character boundaries (I, O, Q, i, o, q)', async () => {
      await expect(decodeVin('XTA229000H123456I')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      await expect(decodeVin('XTA229000H123456O')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      await expect(decodeVin('XTA229000H123456Q')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      await expect(decodeVin('xta229000h123456i')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      await expect(decodeVin('xta229000h123456o')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      await expect(decodeVin('xta229000h123456q')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
    });

    test('VIN illegal characters (symbols, spaces inside)', async () => {
      await expect(decodeVin('XTA229000H123456#')).rejects.toThrow('VIN contains invalid characters.');
      await expect(decodeVin('XTA229 00H1234567')).rejects.toThrow('VIN contains invalid characters.');
      await expect(decodeVin('XTA229-00H1234567')).rejects.toThrow('VIN contains invalid characters.');
    });

    test('Stress test: decoding 1000 generated VINs sequentially', async () => {
      const startTime = Date.now();
      const validChars = 'ABCDEFGHJKLMNPRSTVWXYZ0123456789';
      for (let i = 0; i < 1000; i++) {
        let vin = 'XTA229000H'; // 10 chars
        for (let j = 0; j < 7; j++) {
          vin += validChars[Math.floor(Math.random() * validChars.length)];
        }
        const decoded = await decodeVin(vin);
        expect(decoded.make).toBe('Lada');
      }
      const duration = Date.now() - startTime;
      // Expect 1000 decodes to take less than 1.5 seconds (synchronous db lookup)
      expect(duration).toBeLessThan(1500);
    });
  });

  describe('ocrService.js - Path Scanning & False Positives', () => {
    test('recognizeSTS - path containing tests but valid filename C:\\tests\\sts_card.png', async () => {
      const result = await recognizeSTS('C:\\tests\\sts_card.png');
      expect(result).toEqual({ vin: 'XTA219000H1234567' });
    });

    test('recognizeSTS - path containing tests but invalid filename C:\\tests\\something.png', async () => {
      await expect(recognizeSTS('C:\\tests\\something.png')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    test('recognizeSTS - UNIX path containing tests but invalid filename /var/tests/something.jpeg', async () => {
      await expect(recognizeSTS('/var/tests/something.jpeg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    test('recognizeSTS - UNIX path with sts in folder but not in filename /sts/tests/mycar.jpg', async () => {
      await expect(recognizeSTS('/sts/tests/mycar.jpg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    test('recognizeDashboard - path containing tests but valid filename C:\\tests\\odometer_dash.jpg', async () => {
      const result = await recognizeDashboard('C:\\tests\\odometer_dash.jpg');
      const res = result;
      expect(res).toEqual({ mileage: 85200 });
    });

    test('recognizeDashboard - path containing tests but invalid filename C:\\tests\\something.jpg', async () => {
      await expect(recognizeDashboard('C:\\tests\\something.jpg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    test('recognizeDashboard - UNIX path containing tests but invalid filename /var/tests/mycar.png', async () => {
      await expect(recognizeDashboard('/var/tests/mycar.png')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    test('ocrService - empty, null, undefined and invalid parameter boundaries', async () => {
      await expect(recognizeSTS(null)).rejects.toThrow();
      await expect(recognizeSTS(undefined)).rejects.toThrow();
      await expect(recognizeSTS('')).rejects.toThrow();
      await expect(recognizeSTS('  ')).rejects.toThrow();
      await expect(recognizeSTS(9999)).rejects.toThrow();
      await expect(recognizeSTS([])).rejects.toThrow();
      await expect(recognizeSTS({})).rejects.toThrow();
      await expect(recognizeSTS({ name: 123 })).rejects.toThrow();
    });

    test('Stress test: 100 concurrent OCR requests', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        const isSTS = i % 2 === 0;
        if (isSTS) {
          promises.push(recognizeSTS('C:\\tests\\sts_card.png'));
        } else {
          promises.push(recognizeDashboard('C:\\tests\\odometer_dash.jpg'));
        }
      }
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      expect(results.length).toBe(100);
      // Since setTimeout runs concurrently, total time should be close to 200ms plus minimal execution overhead.
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('partsService.js - Extreme Inputs & Performance', () => {
    test('getPartsForVehicle - invalid car formats', () => {
      expect(getPartsForVehicle(null)).toEqual([]);
      expect(getPartsForVehicle(undefined)).toEqual([]);
      expect(getPartsForVehicle({})).toEqual([]);
      expect(getPartsForVehicle({ make: 123, model: 456 })).toEqual([]);
      expect(getPartsForVehicle({ make: 'Lada', model: null })).toEqual([]);
      // Empty strings will trigger dynamic fallback generation instead of returning empty array
      const parts = getPartsForVehicle({ make: '', model: '' });
      expect(parts.length).toBe(5);
      expect(parts[0].oem).toContain('-OIL');
    });

    test('sanitizeSearchQuery - extreme length input performance', () => {
      const longInput = 'A'.repeat(50000) + '!' + 'B'.repeat(50000);
      const startTime = Date.now();
      const result = sanitizeSearchQuery(longInput);
      const duration = Date.now() - startTime;
      expect(result.length).toBe(100000);
      expect(duration).toBeLessThan(200); // Should process quickly
    });

    test('searchParts - malicious looking query or SQL/HTML tags', () => {
      const parts = [{ name: 'Oil Filter', oem: '2108-1012005' }];
      expect(searchParts(parts, "SELECT * FROM users")).toEqual([]);
      expect(searchParts(parts, "<script>alert(1)</script>")).toEqual([]);
      expect(searchParts(parts, "Oil' OR '1'='1")).toEqual([]);
    });

    test('generateShopLink - various OEM formats', () => {
      expect(generateShopLink('exist', null)).toBeNull();
      expect(generateShopLink('exist', undefined)).toBeNull();
      expect(generateShopLink('exist', '')).toBeNull();
      expect(generateShopLink('exist', '  ')).toBeNull();
      expect(generateShopLink('exist', '2108-1012005')).toBe('https://www.exist.ru/Price/?pcode=2108-1012005');
      // Invalid/unknown shop ID
      expect(generateShopLink('invalidShop', '123')).toBeNull();
    });
  });

});
