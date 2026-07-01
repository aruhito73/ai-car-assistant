# Project: AI Car Assistant

## Architecture
The application is a modern, responsive single-page web application built with React, Vite, and Tailwind CSS. It uses a premium dark mode UI (glassmorphism, neon accents) and operates completely client-side, using `localStorage` for state persistence and optional Gemini API (or simulated local AI engine) for advanced chat and diagnostic features.

### Core Modules
1. **App Shell & Theme**: Theme provider (dark theme with glassmorphism), layout wrapper with mobile-responsive sidebar, dashboard overview.
2. **Car Profile & VIN Decoders**: OCR simulator (dashboard/STS), VIN decoder (local RU/CIS database + global NHTSA simulation), model specs & childhood diseases info.
3. **Maintenance & Service Book**: Maintenance scheduler, mileage trackers, CRUD service history log (localStorage).
4. **Finance & Analytics**: Categorized expense tracker, summary metrics, interactive charts (expense distribution, monthly trends).
5. **AI Mechanic & Diagnostics**: Conversation system, OBD-2 fault code dictionary, audio analysis (acoustic diagnosis) engine, and Car Sale Copilot ad generator.
6. **Parts & Reference**: Automated matching of OEM part numbers, direct links to Exist, Autodoc, Ozon, and Autodoc.

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Foundation & Layout | Setup React/Vite/Tailwind, Theme/Layout, UI Components | None | DONE (f66bc8e1-f7ec-4407-adc8-002aa9199782) |
| 2 | M2: VIN & Vehicle Profile | VIN Decoding, local emulator, Vision OCR simulation, Specs, Parts Search | M1 | DONE (4f783873-904a-4b9d-99ed-ed2efe51faa8) |
| 3 | M3: Service Book & Reminders | Service planner grid, CRUD maintenance log, calendar/mileage reminders | M2 | DONE (6697fddf-6576-423c-a67f-b6f7839f0268) |
| 4 | M4: Expense Tracker & Charts | Finance ledger, category graphs, summary statistics dashboard | M3 | DONE (664ea1d3-5cc8-4593-86ab-97ab7ebc8166) |
| 5 | M5: AI Mechanic Chat & Diag | Interactive Chat, OBD-2 codes, Acoustic mock engine, Sale Copilot | M4 | DONE (746fbcbd-f476-4bf8-98fd-3cc290abffa3) |
| 6 | M6: E2E Pass & Hardening | Final E2E integration, E2E test pass (100%), adversarial hardening | M5 | DONE (eb2ed76f-30a4-48ba-b01e-8f6f94c0d1bb) |

---

## Code Layout
```
d:\AI-Car\
├── .agents/                 # Coordinating agent metadata (read-only state files)
├── public/                  # Static assets and mock files
├── src/
│   ├── assets/              # Icons, styling resources, audio mock files
│   ├── components/          # Reusable glassmorphic UI components (Button, Input, Card, Charts, Loader)
│   ├── context/             # CarContext (global car details), ThemeContext (dark/glassmorphism)
│   ├── services/            # vinService.js, aiService.js, ocrService.js, storage.js
│   ├── views/               # Views: Dashboard, ProfileView, ServiceView, FinanceView, ChatView
│   ├── App.jsx              # Main App entry with view-routing
│   ├── index.css            # Tailwind custom styles, animations, and scrollbars
│   └── main.jsx             # React bootstrap entry point
├── tests/                   # Test suite directory
│   ├── unit/                # Unit tests for business logic
│   └── e2e/                 # Playwright E2E integration tests
├── package.json             # NPM dependencies (React, Tailwind, Lucide Icons, Recharts, Vitest/Playwright)
├── tailwind.config.js       # Custom neon colors, backdrop-blur config
└── vite.config.js           # Vite development and test environment configuration
```

---

## Interface Contracts

### 1. Global State Management (CarContext)
The app maintains a shared state for the active vehicle profile:
```javascript
{
  car: {
    vin: string,            // 17-digit VIN
    make: string,           // Lada, Hyundai, VW, etc.
    model: string,          // Granta, Solaris, Focus, etc.
    year: number,
    engine: string,         // e.g. "1.6 MPI", "2.0 TSI"
    transmission: string,   // "Manual", "Automatic"
    currentMileage: number,
    yearlyMileage: number,
  },
  serviceHistory: [
    {
      id: string,
      date: string,         // YYYY-MM-DD
      mileage: number,
      type: string,         // "ТО-1", "Ремонт подвески", "Замена свечей"
      cost: number,
      notes: string
    }
  ],
  expenses: [
    {
      id: string,
      date: string,
      category: "Fuel" | "Repair" | "Insurance" | "Parking" | "Fines" | "Other",
      cost: number,
      notes: string
    }
  ],
  reminders: [
    {
      id: string,
      type: "insurance" | "tyres" | "maintenance",
      title: string,
      dueDate: string,      // YYYY-MM-DD
      dueMileage?: number,
      active: boolean
    }
  ]
}
```

### 2. VIN Decoder Service
`src/services/vinService.js`
- `decodeVin(vin: string): Promise<CarSpecification>`
- Returns specifications, childhood diseases list, and OEM parts list.

### 3. OCR Simulation Service
`src/services/ocrService.js`
- `recognizeSTS(imageFile: File): Promise<{ vin: string }>`
- `recognizeDashboard(imageFile: File): Promise<{ mileage: number }>`

### 4. AI Mechanic Service
`src/services/aiService.js`
- `sendMessageToAI(message: string, history: Array<Message>, carProfile: Car): Promise<string>`
- `parseOBDCode(code: string): { code: string, description: string, causes: string[], severity: 'low' | 'medium' | 'high', recommendation: string }`
- `analyzeAcousticNoise(audioFile: File): Promise<{ diagnosis: string, confidence: number, partsNeeded: string[] }>`
- `generateSaleAd(carProfile: Car, history: Array<ServiceHistory>): Promise<string>`
