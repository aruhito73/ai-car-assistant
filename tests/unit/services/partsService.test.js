import { describe, it, expect } from 'vitest';
import { 
  getPartsForVehicle, 
  searchParts, 
  getPartShopLinks, 
  sanitizeSearchQuery,
  generateShopLink 
} from '../../../src/services/partsService.js';

describe('Parts Service Business Logic', () => {
  const ladaCar = { make: 'Lada', model: 'Granta', engine: '1.6 MPI' };
  const jettaCar = { make: 'Volkswagen', model: 'Jetta', engine: '1.4 TSI' };

  it('Matches catalog parts for known Granta profile', () => {
    const parts = getPartsForVehicle(ladaCar);
    expect(parts.some(p => p.name === 'Масляный фильтр' && p.oem === '2108-1012005')).toBe(true);
    expect(parts.some(p => p.name === 'Ремень ГРМ с роликом' && p.oem === '1987946282')).toBe(true);
  });

  it('Matches catalog parts for known Jetta profile', () => {
    const parts = getPartsForVehicle(jettaCar);
    expect(parts.some(p => p.name === 'Салонный фильтр' && p.oem === '5Q0819653')).toBe(true);
  });

  it('Generates plausible parts for unknown vehicles', () => {
    const custom = { make: 'Tesla', model: 'Model 3', engine: 'Electric' };
    const parts = getPartsForVehicle(custom);
    expect(parts.length).toBe(5); // Oil, filter, air filter, sparks, brake pads
    expect(parts[0].oem).toContain('TES-'); // Make-prefixed
  });

  it('Builds correct search query redirects when shopLinks is not provided', () => {
    const links = getPartShopLinks({ name: 'Generic Air', oem: '9999' });
    expect(links.exist).toBe('https://www.exist.ru/Price/?pcode=9999');
    expect(links.autodoc).toBe('https://www.autodoc.ru/price/all/9999');
    expect(links.ozon).toBe('https://www.ozon.ru/search/?text=9999');
  });

  it('Preserves explicit shopLinks and overrides missing with null', () => {
    const customPart = { 
      name: 'Filter', 
      oem: '5Q0819653', 
      shopLinks: { autodoc: 'https://autodoc.ru', autostrong: 'https://autostrong.ru' } 
    };
    const links = getPartShopLinks(customPart);
    expect(links.autodoc).toBe('https://autodoc.ru');
    expect(links.autostrong).toBe('https://autostrong.ru');
    expect(links.exist).toBeNull();
  });

  it('Cleans input strings via sanitization', () => {
    expect(sanitizeSearchQuery('OEM# $%^&*()')).toBe('oem');
    expect(sanitizeSearchQuery('  2108-1012005  ')).toBe('21081012005');
  });

  it('Resets search and filters parts correctly', () => {
    const testParts = [
      { name: 'Oil Filter', oem: '2108-1012005' },
      { name: 'Timing Belt Kit', oem: '1987946282' }
    ];

    // Happy path search
    let matches = searchParts(testParts, 'Oil');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('Oil Filter');

    // Empty query resets to default parts
    matches = searchParts(testParts, '');
    expect(matches.length).toBe(2);

    // Sanitized special characters matches
    matches = searchParts(testParts, 'Oil# $%^');
    expect(matches.length).toBe(1);

    // Completely invalid search yields empty
    matches = searchParts(testParts, '#$%^&*()');
    expect(matches.length).toBe(0);
  });

  it('Searches global parts directory as fallback', () => {
    const localParts = [{ name: 'Oil Filter', oem: '2108-1012005' }];
    // Search Jetta cabin filter OEM (not local but exists globally)
    const results = searchParts(localParts, '5Q0819653');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Салонный фильтр');
  });
});
