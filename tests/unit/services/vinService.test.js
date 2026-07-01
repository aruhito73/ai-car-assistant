import { describe, test, expect } from 'vitest';
import { decodeVin, generateShopLinks } from '../../../src/services/vinService.js';

describe('VIN Decoding Service (vinService.js)', () => {

  describe('VIN Format & Validation', () => {
    test('should reject VINs that are not strings or do not have length 17', async () => {
      await expect(decodeVin(null)).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin(undefined)).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin('')).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin('XTA219000H')).rejects.toThrow('VIN must be exactly 17 characters.');
      await expect(decodeVin('XTA219000H123456789')).rejects.toThrow('VIN must be exactly 17 characters.');
    });

    test('should reject VINs containing forbidden characters I, O, Q', async () => {
      // Contains 'O'
      await expect(decodeVin('XTA219000H123456O')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      // Contains 'I'
      await expect(decodeVin('XTA219000H123456I')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
      // Contains 'Q'
      await expect(decodeVin('XTA219000H123456Q')).rejects.toThrow('VIN contains invalid characters (I, O, Q are not allowed).');
    });

    test('should reject VINs containing non-alphanumeric characters', async () => {
      await expect(decodeVin('XTA219000H123456#')).rejects.toThrow('VIN contains invalid characters.');
      await expect(decodeVin('XTA219000H12345_7')).rejects.toThrow('VIN contains invalid characters.');
    });

    test('should handle valid lowercase VINs by normalizing them', async () => {
      const result = await decodeVin('xta219000h1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
    });
  });

  describe('Local Database Emulator (RU/CIS Models)', () => {
    test('should decode exact fixture Lada Granta VIN', async () => {
      const result = await decodeVin('XTA219000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.year).toBe(2017);
      expect(result.engine).toBe('1.6 MPI');
      expect(result.transmission).toBe('Manual');
      expect(result.specs).toEqual({ hp: 87, fuelType: 'Petrol', weight: '1160 kg' });
      expect(result.diseases).toContain('Thermostat failure at 50,000 km');
      expect(result.parts.length).toBeGreaterThan(0);
      expect(result.parts[0].name).toBe('Масляный фильтр');
      expect(result.parts[0].oem).toBe('2108-1012005');
      expect(result.parts[0].shopLinks.autodoc).toBe('https://www.autodoc.ru/price/all/2108-1012005');
    });

    test('should decode a generic Lada Vesta VIN with correct specifications and diseases', async () => {
      // XTA218... H is year 2017
      const result = await decodeVin('XTA218000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Vesta');
      expect(result.year).toBe(2017);
      expect(result.diseases).toContain('Stabilizer squeaks');
      expect(result.parts[0].oem).toBe('21080-1012005-08');
    });

    test('should decode Lada Granta Automatic VIN successfully', async () => {
      const result = await decodeVin('XTA229000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Granta');
      expect(result.transmission).toBe('Automatic');
    });

    test('should decode Lada Vesta Automatic VIN successfully', async () => {
      const result = await decodeVin('XTA228000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Vesta');
      expect(result.transmission).toBe('Automatic');
    });

    test('should decode Hyundai Solaris / Kia Rio', async () => {
      // Hyundai Solaris: Z94C... J (2018)
      const solaris = await decodeVin('Z94CT9000J1234567');
      expect(solaris.make).toBe('Hyundai');
      expect(solaris.model).toBe('Solaris');
      expect(solaris.year).toBe(2018);
      expect(solaris.diseases).toContain('Weak catalytic converter');

      // Kia Rio: Z94D... K (2019)
      const rio = await decodeVin('Z94DT9000K1234567');
      expect(rio.make).toBe('Kia');
      expect(rio.model).toBe('Rio');
      expect(rio.year).toBe(2019);
      expect(rio.diseases).toContain('Hard plastic cabin squeaks');
    });

    test('should decode VW Polo', async () => {
      // VW Polo: XW8ZZZ61... L (2020)
      const polo = await decodeVin('XW8ZZZ61ZLH123456');
      expect(polo.make).toBe('Volkswagen');
      expect(polo.model).toBe('Polo');
      expect(polo.year).toBe(2020);
      expect(polo.diseases).toContain('Cold start engine knocking (CFNA 1.6 engine)');
    });

    test('should decode Ford Focus', async () => {
      // Ford Focus: X9F... M (2021)
      const focus = await decodeVin('X9FXXX999M1234567');
      expect(focus.make).toBe('Ford');
      expect(focus.model).toBe('Focus');
      expect(focus.year).toBe(2021);
      expect(focus.diseases).toContain('PowerShift clutch judder');
    });

    test('should decode Toyota Camry', async () => {
      // Toyota Camry: XW7... N (2022)
      const camry = await decodeVin('XW7BK9999N1234567');
      expect(camry.make).toBe('Toyota');
      expect(camry.model).toBe('Camry');
      expect(camry.year).toBe(2022);
      expect(camry.diseases).toContain('Torque converter shutter');
    });
  });

  describe('Global API Fallback Simulation', () => {
    test('should decode exact fixture VW Jetta VIN', async () => {
      const result = await decodeVin('3VW2K7AJ0HM123456');
      expect(result.make).toBe('Volkswagen');
      expect(result.model).toBe('Jetta');
      expect(result.year).toBe(2017);
      expect(result.engine).toBe('1.4 TSI');
      expect(result.transmission).toBe('Automatic');
      expect(result.specs).toEqual({ hp: 150, fuelType: 'Petrol', weight: '1350 kg' });
      expect(result.diseases).toContain('High oil consumption (EA211 engine)');
      expect(result.parts.length).toBeGreaterThan(0);
      expect(result.parts[0].name).toBe('Масляный фильтр');
      expect(result.parts[0].oem).toBe('04E115561H');
    });

    test('should return plausible properties for generic foreign VINs', async () => {
      // Ford US: 1FT... J (2018)
      const result = await decodeVin('1FT999000JH123456');
      expect(result.make).toBe('Ford');
      expect(result.model).toBe('Focus');
      expect(result.year).toBe(2018);
      expect(result.specs.hp).toBe(125);
    });
  });

  describe('Dynamic Parts Link Generation', () => {
    test('should generate correct search links for a given OEM number', () => {
      const oem = '5Q0819653';
      const links = generateShopLinks(oem);
      expect(links.autodoc).toBe('https://www.autodoc.ru/price/all/5Q0819653');
      expect(links.exist).toBe('https://www.exist.ru/Price/?pcode=5Q0819653');
      expect(links.ozon).toBe('https://www.ozon.ru/search/?text=5Q0819653');
      expect(links.autostrong).toBe('https://autostrong.ru/search?q=5Q0819653');
    });

    test('should sanitize OEM number by removing spaces and special characters', () => {
      const oem = '2108-1012005';
      const links = generateShopLinks(oem);
      expect(links.autodoc).toBe('https://www.autodoc.ru/price/all/21081012005');
      expect(links.exist).toBe('https://www.exist.ru/Price/?pcode=21081012005');
    });
  });
});
