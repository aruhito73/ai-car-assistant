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
      expect(result).toEqual({
        make: 'Lada',
        model: 'Granta',
        year: 2017,
        engine: '1.6 MPI',
        transmission: 'Manual',
        specs: { hp: 87, fuelType: 'Petrol', weight: '1160 kg' },
        diseases: [
          'Thermostat failure at 50,000 km',
          'Noisy manual transmission bearings',
          'Ignition coil short circuits'
        ],
        parts: [
          {
            name: 'Oil Filter',
            oem: '2108-1012005',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/2108-1012005',
              exist: 'https://www.exist.ru/Price/?pcode=2108-1012005',
              ozon: 'https://www.ozon.ru/search/?text=2108-1012005',
              emex: 'https://emex.ru/f?detailNum=2108-1012005',
              autostrong: 'https://autostrong.ru/search?q=2108-1012005'
            }
          },
          {
            name: 'Timing Belt Kit',
            oem: '1987946282',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/1987946282',
              exist: 'https://www.exist.ru/Price/?pcode=1987946282',
              ozon: 'https://www.ozon.ru/search/?text=1987946282',
              emex: 'https://emex.ru/f?detailNum=1987946282',
              autostrong: 'https://autostrong.ru/search?q=1987946282'
            }
          },
          {
            name: 'Engine Oil',
            oem: '5W-40-LADA',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/5W-40-LADA',
              exist: 'https://www.exist.ru/Price/?pcode=5W-40-LADA',
              ozon: 'https://www.ozon.ru/search/?text=5W-40-LADA',
              emex: 'https://emex.ru/f?detailNum=5W-40-LADA',
              autostrong: 'https://autostrong.ru/search?q=5W-40-LADA'
            }
          },
          {
            name: 'Air Filter',
            oem: '2112-1109080',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/2112-1109080',
              exist: 'https://www.exist.ru/Price/?pcode=2112-1109080',
              ozon: 'https://www.ozon.ru/search/?text=2112-1109080',
              emex: 'https://emex.ru/f?detailNum=2112-1109080',
              autostrong: 'https://autostrong.ru/search?q=2112-1109080'
            }
          },
          {
            name: 'Spark Plugs',
            oem: '21110-3707010-00',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/21110-3707010-00',
              exist: 'https://www.exist.ru/Price/?pcode=21110-3707010-00',
              ozon: 'https://www.ozon.ru/search/?text=21110-3707010-00',
              emex: 'https://emex.ru/f?detailNum=21110-3707010-00',
              autostrong: 'https://autostrong.ru/search?q=21110-3707010-00'
            }
          },
          {
            name: 'Brake Pads',
            oem: '11180-3501080-00',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/11180-3501080-00',
              exist: 'https://www.exist.ru/Price/?pcode=11180-3501080-00',
              ozon: 'https://www.ozon.ru/search/?text=11180-3501080-00',
              emex: 'https://emex.ru/f?detailNum=11180-3501080-00',
              autostrong: 'https://autostrong.ru/search?q=11180-3501080-00'
            }
          }
        ]
      });
    });

    test('should decode a generic Lada Vesta VIN with correct specifications and diseases', async () => {
      // XTA218... H is year 2017
      const result = await decodeVin('XTA218000H1234567');
      expect(result.make).toBe('Lada');
      expect(result.model).toBe('Vesta');
      expect(result.year).toBe(2017);
      expect(result.diseases).toContain('Stabilizer squeaks');
      expect(result.parts[0].oem).toBe('2108-1012005');
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
      expect(result).toEqual({
        make: 'Volkswagen',
        model: 'Jetta',
        year: 2017,
        engine: '1.4 TSI',
        transmission: 'Automatic',
        specs: { hp: 150, fuelType: 'Petrol', weight: '1350 kg' },
        diseases: [
          'High oil consumption (EA211 engine)',
          'Wastegate actuator rattle',
          'DSG DQ200 clutch wear'
        ],
        parts: [
          {
            name: 'Cabin Air Filter',
            oem: '5Q0819653',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/5Q0819653',
              exist: 'https://www.exist.ru/Price/?pcode=5Q0819653',
              ozon: 'https://www.ozon.ru/search/?text=5Q0819653',
              emex: 'https://emex.ru/f?detailNum=5Q0819653',
              autostrong: 'https://autostrong.ru/search?q=5Q0819653'
            }
          },
          {
            name: 'Oil Filter',
            oem: '04E115561H',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/04E115561H',
              exist: 'https://www.exist.ru/Price/?pcode=04E115561H',
              ozon: 'https://www.ozon.ru/search/?text=04E115561H',
              emex: 'https://emex.ru/f?detailNum=04E115561H',
              autostrong: 'https://autostrong.ru/search?q=04E115561H'
            }
          },
          {
            name: 'Air Filter',
            oem: '04E129620A',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/04E129620A',
              exist: 'https://www.exist.ru/Price/?pcode=04E129620A',
              ozon: 'https://www.ozon.ru/search/?text=04E129620A',
              emex: 'https://emex.ru/f?detailNum=04E129620A',
              autostrong: 'https://autostrong.ru/search?q=04E129620A'
            }
          },
          {
            name: 'Spark Plugs',
            oem: '04E905612C',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/04E905612C',
              exist: 'https://www.exist.ru/Price/?pcode=04E905612C',
              ozon: 'https://www.ozon.ru/search/?text=04E905612C',
              emex: 'https://emex.ru/f?detailNum=04E905612C',
              autostrong: 'https://autostrong.ru/search?q=04E905612C'
            }
          },
          {
            name: 'Brake Pads',
            oem: '5Q0698151B',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/5Q0698151B',
              exist: 'https://www.exist.ru/Price/?pcode=5Q0698151B',
              ozon: 'https://www.ozon.ru/search/?text=5Q0698151B',
              emex: 'https://emex.ru/f?detailNum=5Q0698151B',
              autostrong: 'https://autostrong.ru/search?q=5Q0698151B'
            }
          },
          {
            name: 'Engine Oil',
            oem: '5W-30-VW',
            shopLinks: {
              autodoc: 'https://www.autodoc.ru/price/all/5W-30-VW',
              exist: 'https://www.exist.ru/Price/?pcode=5W-30-VW',
              ozon: 'https://www.ozon.ru/search/?text=5W-30-VW',
              emex: 'https://emex.ru/f?detailNum=5W-30-VW',
              autostrong: 'https://autostrong.ru/search?q=5W-30-VW'
            }
          }
        ]
      });
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
