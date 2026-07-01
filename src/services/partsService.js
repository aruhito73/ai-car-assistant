// Predefined Database for popular regional and global models
export const VEHICLE_PARTS_CATALOG = {
  Lada: {
    Granta: [
      { name: 'Oil Filter', oem: '2108-1012005' },
      { name: 'Timing Belt Kit', oem: '1987946282' },
      { name: 'Engine Oil', oem: '5W-40-LADA' },
      { name: 'Air Filter', oem: '2112-1109080' },
      { name: 'Spark Plugs', oem: '21110-3707010-00' },
      { name: 'Brake Pads', oem: '11180-3501080-00' }
    ],
    Vesta: [
      { name: 'Oil Filter', oem: '2108-1012005' },
      { name: 'Air Filter', oem: '8450033130' },
      { name: 'Spark Plugs', oem: '22401-1561R' },
      { name: 'Brake Pads', oem: '8450031520' },
      { name: 'Engine Oil', oem: '5W-40-LADA' }
    ]
  },
  Volkswagen: {
    Jetta: [
      { name: 'Cabin Air Filter', oem: '5Q0819653' },
      { name: 'Oil Filter', oem: '04E115561H' },
      { name: 'Air Filter', oem: '04E129620A' },
      { name: 'Spark Plugs', oem: '04E905612C' },
      { name: 'Brake Pads', oem: '5Q0698151B' },
      { name: 'Engine Oil', oem: '5W-30-VW' }
    ],
    Polo: [
      { name: 'Oil Filter', oem: '03C115561H' },
      { name: 'Air Filter', oem: '036129620J' },
      { name: 'Spark Plugs', oem: '101905601B' },
      { name: 'Brake Pads', oem: '6RU698151A' },
      { name: 'Engine Oil', oem: '5W-40-VW' }
    ]
  },
  Hyundai: {
    Solaris: [
      { name: 'Oil Filter', oem: '26300-35505' },
      { name: 'Air Filter', oem: '28113-H8100' },
      { name: 'Spark Plugs', oem: '18846-10060' },
      { name: 'Brake Pads', oem: '58101-H5A25' },
      { name: 'Engine Oil', oem: '5W-30-HYUNDAI' }
    ]
  },
  Kia: {
    Rio: [
      { name: 'Oil Filter', oem: '26300-35505' },
      { name: 'Air Filter', oem: '28113-H8100' },
      { name: 'Spark Plugs', oem: '18846-10060' },
      { name: 'Brake Pads', oem: '58101-H5A25' },
      { name: 'Engine Oil', oem: '5W-30-KIA' }
    ]
  },
  Ford: {
    Focus: [
      { name: 'Oil Filter', oem: '1883037' },
      { name: 'Air Filter', oem: '1848220' },
      { name: 'Spark Plugs', oem: '1680032' },
      { name: 'Brake Pads', oem: '1809256' },
      { name: 'Engine Oil', oem: '5W-20-FORD' }
    ]
  },
  Toyota: {
    Camry: [
      { name: 'Oil Filter', oem: '04152-YZZA1' },
      { name: 'Air Filter', oem: '17801-25020' },
      { name: 'Spark Plugs', oem: '90919-01249' },
      { name: 'Brake Pads', oem: '04465-33470' },
      { name: 'Engine Oil', oem: '0W-20-TOYOTA' }
    ]
  }
};

// Childhood diseases database mapping
export const DISEASES_DB = {
  Lada: {
    Granta: [
      'Thermostat failure at 50,000 km',
      'Noisy manual transmission bearings',
      'Ignition coil short circuits'
    ],
    Vesta: [
      'Stabilizer squeaks',
      'High oil consumption (1.8L engine)',
      'Exhauster pipe vibration'
    ]
  },
  Hyundai: {
    Solaris: [
      'Soft rear suspension (first generation)',
      'Weak catalytic converter',
      'Steering rack play / noise'
    ]
  },
  Kia: {
    Rio: [
      'Weak catalytic converter',
      'Steering rack play',
      'Hard plastic cabin squeaks'
    ]
  },
  Volkswagen: {
    Polo: [
      'Cold start engine knocking (CFNA 1.6 engine)',
      'Heater fan squeaking',
      'Front suspension bush wear'
    ],
    Jetta: [
      'High oil consumption (EA211 engine)',
      'Wastegate actuator rattle',
      'DSG DQ200 clutch wear'
    ]
  },
  Ford: {
    Focus: [
      'PowerShift clutch judder',
      'Steering rack knock',
      'Engine mount wear'
    ]
  },
  Toyota: {
    Camry: [
      'Torque converter shutter',
      'Dashboard melting/cracking (under sun)',
      'Brake disc warping'
    ]
  }
};

// Vehicle specifications mapping
export const VEHICLE_SPECS_DB = {
  Lada: {
    Granta: {
      engine: '1.6 MPI',
      specs: { hp: 87, fuelType: 'Petrol', weight: '1160 kg' }
    },
    Vesta: {
      engine: '1.6 MPI',
      specs: { hp: 106, fuelType: 'Petrol', weight: '1230 kg' }
    }
  },
  Hyundai: {
    Solaris: {
      engine: '1.6 MPI',
      specs: { hp: 123, fuelType: 'Petrol', weight: '1150 kg' }
    },
    Elantra: {
      engine: '1.6 MPI',
      specs: { hp: 128, fuelType: 'Petrol', weight: '1280 kg' }
    }
  },
  Kia: {
    Rio: {
      engine: '1.6 MPI',
      specs: { hp: 123, fuelType: 'Petrol', weight: '1150 kg' }
    }
  },
  Volkswagen: {
    Polo: {
      engine: '1.6 MPI',
      specs: { hp: 110, fuelType: 'Petrol', weight: '1200 kg' }
    },
    Jetta: {
      engine: '1.4 TSI',
      specs: { hp: 150, fuelType: 'Petrol', weight: '1350 kg' }
    }
  },
  Ford: {
    Focus: {
      engine: '1.6 Ti-VCT',
      specs: { hp: 125, fuelType: 'Petrol', weight: '1300 kg' }
    }
  },
  Toyota: {
    Camry: {
      engine: '2.5 Dual VVT-i',
      specs: { hp: 181, fuelType: 'Petrol', weight: '1550 kg' }
    },
    Corolla: {
      engine: '1.6 Dual VVT-i',
      specs: { hp: 122, fuelType: 'Petrol', weight: '1250 kg' }
    }
  }
};

// Generates plausible parts with deterministic hashes for custom vehicles
export const generatePlausibleParts = (make, model, engine) => {
  const cleanMake = typeof make === 'string' ? make : 'GEN';
  const cleanModel = typeof model === 'string' ? model : 'CAR';
  const cleanEngine = typeof engine === 'string' ? engine : '';
  
  // Deterministic seed generation
  const keyStr = `${cleanMake}-${cleanModel}-${cleanEngine}`;
  let seed = 0;
  for (let i = 0; i < keyStr.length; i++) {
    seed = (seed << 5) - seed + keyStr.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed);

  const prefix = cleanMake.substring(0, 3).toUpperCase();
  
  return [
    { name: 'Engine Oil', oem: `${prefix}-${(seed % 9000) + 1000}-OIL` },
    { name: 'Oil Filter', oem: `${prefix}-${(seed % 9000) + 2000}-OF` },
    { name: 'Air Filter', oem: `${prefix}-${(seed % 9000) + 3000}-AF` },
    { name: 'Spark Plugs', oem: `${prefix}-${(seed % 9000) + 4000}-SP` },
    { name: 'Brake Pads', oem: `${prefix}-${(seed % 9000) + 5000}-BP` }
  ];
};

// Main entry point for matching parts to a vehicle profile
export const getPartsForVehicle = (car) => {
  if (!car) return [];

  // Prioritize embedded parts array in profile if loaded
  if (car.parts && car.parts.length > 0) {
    return car.parts;
  }

  // Type checks and coercions to prevent TypeError crashes
  if (typeof car?.make !== 'string' || typeof car?.model !== 'string') {
    return [];
  }

  // Lookup in predefined catalog
  const foundMake = Object.keys(VEHICLE_PARTS_CATALOG).find(
    k => k.toLowerCase() === car.make.toLowerCase()
  );

  if (foundMake) {
    const foundModel = Object.keys(VEHICLE_PARTS_CATALOG[foundMake]).find(
      k => k.toLowerCase() === car.model.toLowerCase()
    );

    if (foundModel) {
      return VEHICLE_PARTS_CATALOG[foundMake][foundModel];
    }
  }

  // Dynamic fallback
  return generatePlausibleParts(car.make, car.model, car.engine);
};

// Clean/sanitize user search inputs
export const sanitizeSearchQuery = (query) => {
  if (query === null || query === undefined) return '';
  const queryStr = String(query);
  return queryStr.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Filter matching parts: current vehicle -> global database
export const searchParts = (vehicleParts, rawQuery) => {
  const cleanQuery = String(rawQuery || '').trim();
  if (!cleanQuery) return vehicleParts;

  const sanitized = sanitizeSearchQuery(cleanQuery);
  if (!sanitized) return [];

  // Helper matching function
  const isMatch = (part) => {
    const normName = sanitizeSearchQuery(part?.name);
    const normOem = sanitizeSearchQuery(part?.oem);
    return normName.includes(sanitized) || normOem.includes(sanitized);
  };

  // 1. Check current vehicle profile parts
  let results = (vehicleParts || []).filter(isMatch);

  // 2. Fallback to global registry search if local matches are empty
  if (results.length === 0) {
    const globalParts = [];
    const seenOems = new Set();

    Object.values(VEHICLE_PARTS_CATALOG).forEach(modelGroup => {
      Object.values(modelGroup).forEach(parts => {
        parts.forEach(part => {
          if (part && part.oem && !seenOems.has(part.oem)) {
            seenOems.add(part.oem);
            globalParts.push(part);
          }
        });
      });
    });

    results = globalParts.filter(isMatch);
  }

  return results;
};

// URL Builder for external search platforms
export const generateShopLink = (shopId, oem) => {
  if (oem === null || oem === undefined) return null;
  const oemStr = String(oem).trim();
  if (!oemStr) return null;
  const cleanOem = encodeURIComponent(oemStr);

  switch (shopId) {
    case 'exist':
      return `https://www.exist.ru/Price/?pcode=${cleanOem}`;
    case 'autodoc':
      return `https://www.autodoc.ru/price/all/${cleanOem}`;
    case 'ozon':
      return `https://www.ozon.ru/search/?text=${cleanOem}`;
    case 'emex':
      return `https://emex.ru/f?detailNum=${cleanOem}`;
    case 'autostrong':
      return `https://autostrong.ru/search?q=${cleanOem}`;
    default:
      return null;
  }
};

// Resolves links map. Preserves omitted ones as null when shopLinks is explicitly defined.
export const getPartShopLinks = (part) => {
  const shops = ['autodoc', 'exist', 'ozon', 'emex', 'autostrong'];
  const links = {};

  if (!part) {
    shops.forEach(shop => {
      links[shop] = null;
    });
    return links;
  }

  // Check/coerce oem to string
  let oemStr = '';
  if (part.oem !== null && part.oem !== undefined) {
    oemStr = String(part.oem);
  }

  if (part.shopLinks) {
    // Explicit list defined (mostly mock/seeded data in Jetta/Lada profiles)
    shops.forEach(shop => {
      links[shop] = part.shopLinks[shop] || null;
    });
  } else {
    // Dynamically generated
    shops.forEach(shop => {
      links[shop] = generateShopLink(shop, oemStr);
    });
  }

  return links;
};

export const getPartsWithShopLinks = (car) => {
  const parts = getPartsForVehicle(car);
  return parts.map(part => ({
    ...part,
    shopLinks: getPartShopLinks(part)
  }));
};

export function generateShopLinks(oem) {
  if (oem === null || oem === undefined) return {};
  const oemStr = String(oem).trim();
  if (!oemStr) return {};
  const cleanedOem = oemStr.replace(/[^a-zA-Z0-9]/g, '');
  return {
    autodoc: generateShopLink('autodoc', cleanedOem),
    exist: generateShopLink('exist', cleanedOem),
    ozon: generateShopLink('ozon', cleanedOem),
    autostrong: generateShopLink('autostrong', cleanedOem)
  };
}

