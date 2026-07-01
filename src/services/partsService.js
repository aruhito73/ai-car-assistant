// Predefined Database for popular regional and global models
export const VEHICLE_PARTS_CATALOG = {
  Lada: {
    Granta: [
      { name: 'Масляный фильтр', oem: '2108-1012005', category: 'maintenance' },
      { name: 'Ремень ГРМ с роликом', oem: '1987946282', category: 'maintenance' },
      { name: 'Воздушный фильтр', oem: '2112-1109080', category: 'maintenance' },
      { name: 'Свечи зажигания', oem: '21110-3707010-00', category: 'maintenance' },
      { name: 'Колодки тормозные передние', oem: '11180-3501080-00', category: 'brakes' }
    ],
    Vesta: [
      { name: 'Масляный фильтр', oem: '21080-1012005-08', category: 'maintenance' },
      { name: 'Воздушный фильтр', oem: '8450033130', category: 'maintenance' },
      { name: 'Салонный фильтр', oem: '8450009470', category: 'maintenance' },
      { name: 'Свечи зажигания', oem: '21120-3707010-00 (FR7LDC+)', category: 'maintenance' },
      { name: 'Пробка поддона с кольцом', oem: '8450003017', category: 'maintenance' },
      { name: 'Ремень генератора (с кондеем)', oem: '8450030130', category: 'maintenance' },
      { name: 'Помпа охлаждения', oem: '21126-1307010-82', category: 'maintenance' },
      { name: 'Тормозной диск передний', oem: '8450031131', category: 'brakes' },
      { name: 'Колодки передние', oem: '8450031850', category: 'brakes' },
      { name: 'Тормозной барабан задний', oem: '8450006842', category: 'brakes' },
      { name: 'Колодки задние барабанные', oem: '8450006845', category: 'brakes' },
      { name: 'Стойка амортизатора передняя левая', oem: '8450006787', category: 'suspension' },
      { name: 'Стойка амортизатора передняя правая', oem: '8450006786', category: 'suspension' },
      { name: 'Амортизатор задний', oem: '8450006788', category: 'suspension' },
      { name: 'Рычаг передней подвески левый', oem: '8450006758', category: 'suspension' },
      { name: 'Рычаг передней подвески правый', oem: '8450006757', category: 'suspension' },
      { name: 'Стойка стабилизатора', oem: '8450006748', category: 'suspension' },
      { name: 'Радиатор охлаждения основной', oem: '8450030141', category: 'cooling_electrical' },
      { name: 'Термостат в сборе', oem: '21900-1306010-00', category: 'cooling_electrical' },
      { name: 'Катушка зажигания', oem: '21120-3705010-15', category: 'cooling_electrical' },
      { name: 'Генератор (120A)', oem: '8450006900', category: 'cooling_electrical' },
      { name: 'Стартер', oem: '8450006894', category: 'cooling_electrical' },
      { name: 'Аккумулятор 6ST-64', oem: 'LADA-6ST-64', category: 'cooling_electrical' }
    ]
  },
  Volkswagen: {
    Jetta: [
      { name: 'Масляный фильтр', oem: '04E115561H', category: 'maintenance' },
      { name: 'Воздушный фильтр', oem: '04E129620A', category: 'maintenance' },
      { name: 'Салонный фильтр', oem: '5Q0819653', category: 'maintenance' },
      { name: 'Свечи зажигания', oem: '04E905612C', category: 'maintenance' },
      { name: 'Пробка масляного поддона', oem: 'N90288901', category: 'maintenance' },
      { name: 'Ремень поликлиновой', oem: '04E145933A', category: 'maintenance' },
      { name: 'Тормозной диск передний', oem: '5Q0615301A', category: 'brakes' },
      { name: 'Колодки тормозные передние', oem: '5Q0698151B', category: 'brakes' },
      { name: 'Тормозной диск задний', oem: '5Q0615601D', category: 'brakes' },
      { name: 'Колодки задние', oem: '5Q0698451', category: 'brakes' },
      { name: 'Сайлентблок переднего рычага задний', oem: '5Q0407183L', category: 'suspension' },
      { name: 'Амортизатор передний', oem: '5Q0413023FH', category: 'suspension' },
      { name: 'Амортизатор задний', oem: '5Q0513029HR', category: 'suspension' },
      { name: 'Стойка стабилизатора передняя', oem: '5Q0411315G', category: 'suspension' },
      { name: 'Радиатор охлаждения основной', oem: '5Q0121251GQ', category: 'cooling_electrical' },
      { name: 'Насос системы охлаждения (помпа)', oem: '04E121600BD', category: 'cooling_electrical' },
      { name: 'Катушка зажигания', oem: '04E905110K', category: 'cooling_electrical' },
      { name: 'Генератор (140A)', oem: '04C903023T', category: 'cooling_electrical' },
      { name: 'Стартер', oem: '02M911024A', category: 'cooling_electrical' },
      { name: 'Аккумулятор EFB 68Ah', oem: '000915105CC', category: 'cooling_electrical' }
    ],
    Polo: [
      { name: 'Масляный фильтр', oem: '03C115561H', category: 'maintenance' },
      { name: 'Воздушный фильтр', oem: '036129620J', category: 'maintenance' },
      { name: 'Свечи зажигания', oem: '101905601B', category: 'maintenance' },
      { name: 'Колодки передние', oem: '6RU698151A', category: 'brakes' }
    ]
  },
  Toyota: {
    Camry: [
      { name: 'Масляный фильтр', oem: '04152-YZZA1', category: 'maintenance' },
      { name: 'Воздушный фильтр', oem: '17801-25020', category: 'maintenance' },
      { name: 'Свечи зажигания', oem: '90919-01249', category: 'maintenance' },
      { name: 'Колодки тормозные передние', oem: '04465-33470', category: 'brakes' }
    ]
  },
  Mercedes: {
    'G63 AMG': [
      // Расходники ТО
      { name: 'Масляный фильтр', oem: 'A 177 180 01 10 или A 278 180 00 09', category: 'maintenance' },
      { name: 'Воздушный фильтр (левый)', oem: 'A 177 094 00 00', category: 'maintenance' },
      { name: 'Воздушный фильтр (правый)', oem: 'A 177 094 01 00', category: 'maintenance' },
      { name: 'Свечи зажигания', oem: 'A 000 159 05 00', category: 'maintenance' },
      { name: 'Пробка поддона', oem: 'N 000000 008789', category: 'maintenance' },
      { name: 'Уплотнительное кольцо', oem: 'N 007603 014106', category: 'maintenance' },
      { name: 'Ремень генератора', oem: 'A 003 993 41 96', category: 'maintenance' },
      { name: 'Ремень кондиционера', oem: 'A 003 993 42 96', category: 'maintenance' },
      { name: 'Помпа охлаждения', oem: 'A 177 200 04 00', category: 'maintenance' },
      // Тормозная система
      { name: 'Тормозной диск передний', oem: 'A 463 421 05 00', category: 'brakes' },
      { name: 'Колодки передние', oem: 'A 000 420 41 05 / A 000 420 13 03', category: 'brakes' },
      { name: 'Тормозной диск задний', oem: 'A 463 423 00 00', category: 'brakes' },
      { name: 'Колодки задние', oem: 'A 000 420 52 02 / A 000 420 37 05 / A 000 420 15 06', category: 'brakes' },
      { name: 'Актуатор электроручника', oem: 'A 167 906 200 464', category: 'brakes' },
      // Подвеска & Ходовая
      { name: 'Кардан передний', oem: 'A 463 410 04 00', category: 'suspension' },
      { name: 'Кардан задний', oem: 'A 463 410 17 00', category: 'suspension' },
      { name: 'Опора двигателя (левая)', oem: 'A 463 240 06 00 / A 463 241 11 00', category: 'suspension' },
      { name: 'Опора двигателя (правая)', oem: 'A 463 240 05 00 / A 463 241 12 00', category: 'suspension' },
      { name: 'Амортизатор передний (лев/прав)', oem: 'A 463 320 53 01 / A 463 320 55 01', category: 'suspension' },
      { name: 'Амортизатор задний (лев/прав)', oem: 'A 463 320 35 02 ... 61 01 / A 463 320 36 02 ... 62 01', category: 'suspension' },
      { name: 'Рычаг верхний (лев/прав)', oem: 'A 463 330 79 01 / A 463 330 80 01', category: 'suspension' },
      { name: 'Рычаг нижний (лев/прав)', oem: 'A 463 330 95 01 / A 463 330 96 01', category: 'suspension' },
      { name: 'Поворотный кулак (лев/прав)', oem: 'A 463 332 00 00 / A 463 332 01 00', category: 'suspension' },
      { name: 'Ступица передняя', oem: 'A 463 334 00 00', category: 'suspension' },
      { name: 'Привод передний (лев/прав)', oem: 'A 463 300 702 / A 463 300 802', category: 'suspension' },
      { name: 'Рулевая тяга (лев/прав)', oem: 'A 4633 304 701 / A 4633 304 801', category: 'suspension' },
      { name: 'Рычаги задние продольный низ', oem: 'A 463 350 30 01', category: 'suspension' },
      { name: 'Рычаги задние поперечный', oem: 'A 463 350 10 01', category: 'suspension' },
      { name: 'Рычаги задние верхний', oem: 'A 463 350 31 01', category: 'suspension' },
      // Системы охлаждения & Электрика
      { name: 'Радиатор основной', oem: 'A 167 500 03 00', category: 'cooling_electrical' },
      { name: 'Вентилятор', oem: 'A 167 906 91 06 / A 167 906 19 04', category: 'cooling_electrical' },
      { name: 'Радиатор нижний передний правый', oem: 'A 099 500 58 00', category: 'cooling_electrical' },
      { name: 'Радиатор нижний передний правый задний', oem: 'A 099 500 59 00', category: 'cooling_electrical' },
      { name: 'Радиатор нижний передний левый', oem: 'A 099 500 58 00', category: 'cooling_electrical' },
      { name: 'Масляный радиатор ДВС', oem: 'A 099 500 04 01', category: 'cooling_electrical' },
      { name: 'Масляный охладитель КПП', oem: 'A 099 500 60 00', category: 'cooling_electrical' },
      { name: 'Опора КПП', oem: 'A 1672 407 100', category: 'cooling_electrical' },
      { name: 'Генератор', oem: 'A 000 906 12 07', category: 'cooling_electrical' },
      { name: 'Стартер', oem: 'A 278 906 06 00', category: 'cooling_electrical' },
      { name: 'Компрессор кондиционера', oem: 'A 000 830 47 02', category: 'cooling_electrical' },
      { name: 'Бензонасос', oem: 'A 463 470 590 064', category: 'cooling_electrical' },
      { name: 'Аккумулятор', oem: 'A 001 982 820 826 (12V/92AH)', category: 'cooling_electrical' },
      { name: 'Датчик давления шины', oem: 'A 000 905 21 02 (Аналог Schrader: 36106887147)', category: 'cooling_electrical' },
      { name: 'Лобовое стекло', oem: 'A 463 670 39 00 / A 463 670 24 00', category: 'cooling_electrical' },
      { name: 'Парктроники передние (крайние 2 шт)', oem: 'A 000 905 56 04', category: 'cooling_electrical' },
      { name: 'Парктроники передние (центр 4 шт)', oem: 'A 000 905 55 04', category: 'cooling_electrical' },
      { name: 'Парктроники задние (6 шт)', oem: 'A 000 905 55 04', category: 'cooling_electrical' }
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
  },
  Mercedes: {
    'G63 AMG': [
      'Engine oil leaks (valve cover gaskets)',
      'Front differential actuator failure',
      'Electronic active dampers clicking'
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
  },
  Mercedes: {
    'G63 AMG': {
      engine: '4.0 Biturbo V8 (M177)',
      specs: { hp: 585, fuelType: 'Petrol', weight: '2560 kg' }
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

