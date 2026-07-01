# Test Infrastructure (Milestone 1)

This document describes the testing infrastructure established for the **AI Car Assistant** application. It supports unit and component testing via **Vitest** and end-to-end integration testing via **Playwright**.

---

## 1. Directory Structure

Testing files are organized inside the `tests/` directory at the project root:

```text
tests/
├── unit/                                  # Vitest unit & component tests
│   ├── setup.js                           # Vitest initialization script (JSDOM environment, mocks)
│   ├── App.test.jsx                       # App smoke tests
│   └── services/
│       └── storage.test.js                # LocalStorage service unit tests
├── e2e/                                   # Playwright end-to-end tests
│   ├── fixtures/
│   │   ├── baseFixture.js                 # Custom test fixture extending Playwright test
│   │   ├── mockData.js                    # Structured JSON data feeds
│   │   └── assets/                        # Mock media files for OCR and acoustic upload tests
│   │       ├── sts_card.png               # Mock STS document for OCR upload
│   │       ├── odometer_dash.jpg          # Mock odometer picture for OCR upload
│   │       ├── engine_knock.mp3           # Mock audio for diagnostic upload
│   │       └── belt_squeal.wav            # Mock audio for diagnostic upload
│   └── helpers/
│       └── stateInit.js                   # Setup state injection routines (localStorage mocks)
```

---

## 2. Configuration Files

### Playwright Configuration (`playwright.config.js`)
Configured to support:
- Headless execution with multi-browser projects (`chromium`, `firefox`, `webkit`) and responsive layout viewports (`Mobile Chrome`, `Mobile Safari`).
- Automated frontend server spawning (`npm run dev`) with healthcheck verification on `http://localhost:5173`.
- HTML reporting stored in `playwright-report/` and terminal `list` outputs.
- Artifact collection (trace logs, screenshots, videos) on test failures.

### Vitest Configuration (`vite.config.js`)
Configured to support:
- Standard Vite React plugin integration.
- Fast `jsdom` simulated browser environment.
- Auto-cleaning of the DOM and `localStorage` mock.
- Glob-based test inclusion targeting `tests/unit/` while completely ignoring E2E specs to avoid runner conflicts.

---

## 3. Mock Data & State Seeding Strategy

To ensure E2E tests run quickly and deterministically without external internet requests, we employ two key techniques:

### State Injection Helper (`tests/e2e/helpers/stateInit.js`)
Tests can inject pre-configured JSON payloads into the browser's `localStorage` context before the React application boots. It seeds the following keys:
- `ai_car_profile`: Active vehicle specs.
- `ai_car_services`: Maintenance history logs.
- `ai_car_expenses`: Ledger expenses list.
- `ai_car_reminders`: Schedule notifications/alerts.
- `ai-car-state`: Combined JSON state.

### File Upload Interception
For OCR and acoustic audio uploads, dummy files are uploaded using Playwright's `setInputFiles` tool. The mocked frontend services check the *filename* of the uploaded file (e.g. `engine_knock.mp3` or `sts_card.png`) and automatically resolve to the pre-packaged mock data outcomes in `tests/e2e/fixtures/mockData.js`, bypassing CPU-heavy audio inference or real network requests.

---

## 4. Setup & Execution Commands

### Prerequisites
Before executing E2E tests for the first time, developers must download and install the required Playwright browser binaries:
```bash
npx playwright install
```

### Running Tests
Use the following npm scripts to run tests:

| Script | Command | Purpose |
|---|---|---|
| `npm run test` | `vitest` | Run Vitest unit tests in watch mode. |
| `npm run test:run` | `vitest run` | Run Vitest unit tests once (CI mode). |
| `npm run test:unit` | `vitest run` | Run Vitest unit tests once. |
| `npm run test:e2e` | `playwright test` | Run Playwright E2E tests. |
| `npm run test:e2e:report` | `playwright show-report` | Open the Playwright HTML test report. |
