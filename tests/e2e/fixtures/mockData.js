export const mockData = {
  // 1. Vehicle Profiles for Profiles & VIN Decoders
  vehicles: {
    ladaGranta: {
      vin: 'XTA219000H1234567',
      make: 'Lada',
      model: 'Granta',
      year: 2017,
      engine: '1.6 MPI',
      transmission: 'Manual',
      currentMileage: 85200,
      yearlyMileage: 15000,
      specs: {
        hp: 87,
        fuelType: 'Petrol',
        weight: '1160 kg'
      },
      diseases: [
        'Thermostat failure at 50,000 km',
        'Noisy manual transmission bearings',
        'Ignition coil short circuits'
      ],
      parts: [
        { name: 'Oil Filter', oem: '2108-1012005', shopLinks: { autodoc: 'https://autodoc.ru', ozon: 'https://ozon.ru' } },
        { name: 'Timing Belt Kit', oem: '1987946282', shopLinks: { autodoc: 'https://autodoc.ru', exist: 'https://exist.ru' } }
      ]
    },
    vwJetta: {
      vin: '3VW2K7AJ0HM123456',
      make: 'Volkswagen',
      model: 'Jetta',
      year: 2018,
      engine: '1.4 TSI',
      transmission: 'Automatic',
      currentMileage: 62000,
      yearlyMileage: 12000,
      specs: {
        hp: 150,
        fuelType: 'Petrol',
        weight: '1350 kg'
      },
      diseases: [
        'High oil consumption (EA211 engine)',
        'Wastegate actuator rattle',
        'DSG DQ200 clutch wear'
      ],
      parts: [
        { name: 'Cabin Air Filter', oem: '5Q0819653', shopLinks: { autodoc: 'https://autodoc.ru', autostrong: 'https://autostrong.ru' } },
        { name: 'Oil Filter', oem: '04E115561H', shopLinks: { autodoc: 'https://autodoc.ru', exist: 'https://exist.ru' } }
      ]
    },
    invalidVinLength: 'XTA219000H',
    invalidVinChars: 'XTA219000H123456O' // 'O' is invalid in VINs
  },

  // 2. Service Log Book Entries
  serviceHistories: {
    standard: [
      {
        id: 'srv-001',
        date: '2025-05-10',
        mileage: 75000,
        type: 'ТО-1 (Engine Oil & Filters)',
        cost: 4500,
        notes: 'Shell Helix Ultra 5W-40, MANN filter.'
      },
      {
        id: 'srv-002',
        date: '2025-11-20',
        mileage: 82500,
        type: 'Suspension Repair',
        cost: 12000,
        notes: 'Replaced front shock absorbers and ball joints.'
      }
    ],
    empty: [],
    boundaryValues: [
      { id: 'srv-edge-001', date: '2026-06-30', mileage: 0, type: 'Zero Mileage Check', cost: 0, notes: '' },
      { id: 'srv-edge-002', date: '2026-06-30', mileage: 999999, type: 'Extreme Values', cost: -500, notes: 'Negative Cost' }
    ]
  },

  // 3. Financial Expense Ledger (by categories)
  expenses: [
    { id: 'exp-001', date: '2026-06-01', category: 'Fuel', cost: 2500, notes: 'Full tank AI-95' },
    { id: 'exp-002', date: '2026-06-15', category: 'Insurance', cost: 9500, notes: 'OSAGO policy renewal' },
    { id: 'exp-003', date: '2026-06-18', category: 'Repair', cost: 12000, notes: 'Suspension work' },
    { id: 'exp-004', date: '2026-06-25', category: 'Other', cost: 800, notes: 'Car wash & cleaning' }
  ],

  // 4. Maintenance Alerts / Reminders (Active & Inactive)
  reminders: [
    { id: 'rem-001', type: 'maintenance', title: 'Timing Belt Replacement', dueDate: '2027-06-30', dueMileage: 120000, active: true },
    { id: 'rem-002', type: 'insurance', title: 'OSAGO Expiration', dueDate: '2027-06-15', active: true },
    { id: 'rem-003', type: 'tyres', title: 'Seasonal Tyre Change', dueDate: '2026-10-15', active: false }
  ],

  // 5. OBD-2 Fault Codes for AI Mechanic
  obdCodes: {
    P0300: {
      code: 'P0300',
      description: 'Random/Multiple Cylinder Misfire Detected',
      causes: ['worn spark plugs', 'bad ignition coil', 'clogged fuel injector', 'vacuum leak'],
      severity: 'high',
      recommendation: 'Pull over immediately. Inspect spark plugs, ignition coils, and fuel injectors.'
    },
    P0420: {
      code: 'P0420',
      description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      causes: ['defective catalytic converter', 'damaged oxygen sensor', 'exhaust leak', 'incorrect fuel mixture'],
      severity: 'medium',
      recommendation: 'Safe to drive home, but catalytic converter or oxygen sensors require diagnosis/replacement.'
    },
    P0113: {
      code: 'P0113',
      description: 'Intake Air Temperature Sensor 1 Circuit High Input',
      causes: ['faulty intake air temperature sensor', 'dirty air filter', 'damaged wiring or connector', 'faulty mass air flow sensor'],
      severity: 'low',
      recommendation: 'Check sensor connection plug. Clean or replace IAT sensor.'
    }
  },

  // 6. Acoustic Sound Diagnostic Outputs
  acousticDiagnoses: {
    engineKnock: { diagnosis: 'Severe rod knock / engine bearing wear detected.', confidence: 0.92, partsNeeded: ['Connecting rod bearings', 'Oil pump', 'Engine gasket kit'] },
    beltSqueal: { diagnosis: 'Serpentine accessory drive belt slipping.', confidence: 0.85, partsNeeded: ['Serpentine belt', 'Idler pulley', 'Belt tensioner'] },
    unknownNoise: { diagnosis: 'Acoustic sample inconclusive. Ensure engine is warm and recorder is placed near cylinder block.', confidence: 0.15, partsNeeded: [] }
  },

  // 7. AI Chat responses (simulated responses for sendMessageToAI messages)
  aiChat: {
    default: "I'm your AI Mechanic assistant. How can I help you diagnose your vehicle today?",
    obdResponses: {
      P0300: "A P0300 code indicates a random or multiple cylinder misfire. Common causes include worn spark plugs, bad ignition coils, or a vacuum leak.",
      P0420: "A P0420 code means your catalytic converter efficiency is below threshold. This is often caused by a failing catalytic converter, oxygen sensor issues, or exhaust leaks.",
      P0113: "A P0113 code indicates high input in the Intake Air Temperature sensor circuit. You should check the sensor wiring or clean the IAT sensor."
    },
    generalQuestions: {
      mileage: "To get the best fuel efficiency, ensure your tyres are properly inflated and you follow the recommended oil change intervals."
    }
  },

  // 8. Sale Ad outputs (simulated advertisement strings generated by generateSaleAd)
  saleAd: {
    ladaGranta: "For Sale: 2017 Lada Granta. Manual transmission, 1.6 MPI engine with 87 HP. Current mileage is 85,200 km. Regularly serviced, with oil changes performed on schedule. Great reliable budget car!",
    vwJetta: "For Sale: 2018 Volkswagen Jetta. Automatic transmission, 1.4 TSI engine with 150 HP. Current mileage is 62,000 km. Service history is fully documented, DSG and engine are in excellent condition."
  }
};
