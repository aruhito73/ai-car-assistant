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

describe('Adversarial and Boundary Tests for Services', () => {

  describe('vinService.js Adversarial Tests', () => {
    test('decodeVin - valid VIN with leading/trailing spaces', async () => {
      const result = await decodeVin('  XTA219000H1234567  ');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
    });

    test('decodeVin - valid lowercase VIN with leading/trailing spaces', async () => {
      const result = await decodeVin('  xta219000h1234567  ');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
    });

    test('decodeVin - 17 spaces string', async () => {
      await expect(decodeVin('                 ')).rejects.toThrow('VIN must be exactly 17 characters.');
    });

    test('decodeVin - unexpected object types', async () => {
      await expect(decodeVin(123)).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin({})).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin([])).rejects.toThrow('VIN must be exactly 17 characters.');
    });

    test('decodeVin - valid characters but multiple spaces inside', async () => {
      await expect(decodeVin('XTA219000H12345 7')).rejects.toThrow('VIN contains invalid characters.');
    });

    test('generateShopLinks - behavior with non-string inputs', () => {
      // Coerces number to string, objects to empty/string safely
      expect(generateShopLinks(123)).toEqual({
        autodoc: 'https://www.autodoc.ru/price/all/123',
        exist: 'https://www.exist.ru/Price/?pcode=123',
        ozon: 'https://www.ozon.ru/search/?text=123',
        autostrong: 'https://autostrong.ru/search?q=123'
      });
      expect(generateShopLinks({})).toEqual({
        autodoc: 'https://www.autodoc.ru/price/all/objectObject',
        exist: 'https://www.exist.ru/Price/?pcode=objectObject',
        ozon: 'https://www.ozon.ru/search/?text=objectObject',
        autostrong: 'https://autostrong.ru/search?q=objectObject'
      });
    });
  });

  describe('ocrService.js Adversarial Tests', () => {
    test('recognizeSTS - filename with trailing spaces', async () => {
      // With our fix, trailing spaces in filename are trimmed and parsed successfully
      const result = await recognizeSTS('sts_card.png ');
      expect(result).toEqual({ vin: 'XTA219000H1234567' });
    });

    test('recognizeSTS - filename with no extension', async () => {
      await expect(recognizeSTS('sts_card')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    test('recognizeSTS - unexpected types', async () => {
      await expect(recognizeSTS(123)).rejects.toThrow();
      await expect(recognizeSTS({})).rejects.toThrow();
      await expect(recognizeSTS(['sts_card.png'])).rejects.toThrow();
      await expect(recognizeSTS({ name: 123 })).rejects.toThrow();
    });

    test('recognizeDashboard - filename with trailing spaces', async () => {
      const result = await recognizeDashboard('odometer_dash.jpg ');
      expect(result).toEqual({ mileage: 85200 });
    });

    test('recognizeDashboard - unexpected types', async () => {
      await expect(recognizeDashboard(123)).rejects.toThrow();
      await expect(recognizeDashboard({})).rejects.toThrow();
      await expect(recognizeDashboard({ name: 123 })).rejects.toThrow();
    });
  });

  describe('partsService.js Adversarial Tests', () => {
    test('getPartsForVehicle - unexpected object types for make/model/engine', () => {
      // These should not throw TypeError anymore; they should return empty array []
      expect(getPartsForVehicle({ make: {} })).toEqual([]);
      expect(getPartsForVehicle({ make: 123 })).toEqual([]);
      expect(getPartsForVehicle({ make: true })).toEqual([]);
    });

    test('getPartsForVehicle - null or undefined car', () => {
      expect(getPartsForVehicle(null)).toEqual([]);
      expect(getPartsForVehicle(undefined)).toEqual([]);
    });

    test('getPartsForVehicle - empty car object', () => {
      // Since make/model are not strings, it returns [] directly
      const parts = getPartsForVehicle({});
      expect(parts).toEqual([]);
    });

    test('sanitizeSearchQuery - non-string inputs', () => {
      // Should coerce and not throw
      expect(sanitizeSearchQuery(123)).toBe('123');
      expect(sanitizeSearchQuery({})).toBe('objectobject');
    });

    test('searchParts - non-string queries', () => {
      const parts = [{ name: 'Oil Filter', oem: '2108-1012005' }];
      // Should coerce query and not throw
      expect(searchParts(parts, 123)).toEqual([]);
      expect(searchParts(parts, {})).toEqual([]);
    });

    test('generateShopLink - non-string oem', () => {
      // Should coerce oem and build the link successfully
      expect(generateShopLink('autodoc', 123)).toBe('https://www.autodoc.ru/price/all/123');
    });

    test('getPartShopLinks - non-string oem inside part', () => {
      const part = { name: 'Oil Filter', oem: 123 };
      // Should coerce oem and return links successfully
      const links = getPartShopLinks(part);
      expect(links.autodoc).toBe('https://www.autodoc.ru/price/all/123');
    });

    test('getPartShopLinks - null or undefined part', () => {
      // Should gracefully return null links and not throw
      expect(getPartShopLinks(null)).toEqual({
        autodoc: null,
        exist: null,
        ozon: null,
        emex: null,
        autostrong: null
      });
      expect(getPartShopLinks(undefined)).toEqual({
        autodoc: null,
        exist: null,
        ozon: null,
        emex: null,
        autostrong: null
      });
    });
  });

});
