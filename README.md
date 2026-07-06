# Chronic Disease Tracker

A SMART on FHIR patient-facing web application for tracking chronic disease management across three conditions: Diabetes (DM), Hypertension (HTN), and Hyperlipidemia (HLD).

> **Demo application — no real patient data.** This app was built using synthetic FHIR data and does not connect to, store, or transmit any real patient health information.

---

## Overview

The app launches via the SMART on FHIR OAuth2 flow and reads FHIR R4 resources (Patient, Condition, Observation) from a FHIR server. It displays condition-specific lab trends and clinical metrics in a tabbed dashboard, and surfaces a recommended care checklist for diabetic patients — prompting them to stay current on key screenings and follow-up tests.

Conditions tracked:

- **Diabetes** — HbA1c, fasting glucose, body weight, eGFR, uACR, blood pressure
- **Hypertension** — systolic and diastolic BP trends
- **Hyperlipidemia** — LDL, HDL, total cholesterol, triglycerides, non-HDL

---

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4, ShadCN UI (radix-nova style), Recharts
- `fhirclient` for SMART on FHIR OAuth2 and FHIR resource access
- React Router v7

---

## Getting Started

```bash
npm install
npm run dev
```

The app expects to be launched from a SMART-enabled EHR or sandbox (e.g., SMART Health IT launcher). It is not designed to run as a standalone app without a FHIR context.

**Routes:**

- `/instructions` — landing page with launch instructions
- `/launch` — initiates `FHIR.oauth2.authorize`
- `/app` — redirect URI and main application shell

---

## Commands

| Command                      | Description                       |
| ---------------------------- | --------------------------------- |
| `npm run dev`                | Start Vite dev server with HMR    |
| `npm run build`              | Type-check (`tsc -b`) then bundle |
| `npm run lint`               | Run ESLint                        |
| `npx shadcn add <component>` | Add a ShadCN UI component         |

---

## Data & Privacy

This application was built and tested exclusively against **synthetic FHIR data** (e.g., Synthea-generated patients). It does not:

- Connect to any real EHR or production FHIR endpoint
- Store, log, or transmit patient data
- Persist any session data beyond the active browser session

All FHIR access is mediated through the `fhirclient` library using the `patient/*.read` scope. No data leaves the browser.

---

## Known Limitations

### Sparse observation data

Synthetic patient records often have thin or irregular observation histories. Charts may render with few data points or display "no data" states that would be less common in real-world EHR data. The recommended care checklist for diabetic patients may also show incomplete or inconclusive results for the same reason.

### Cholesterol targets are not ASCVD risk-stratified

LDL and Non-HDL goals are currently fixed values applied uniformly to all patients — LDL &lt;100 mg/dL and Non-HDL &lt;130 mg/dL. This does not conform to current [ACC/AHA lipid management guidelines (2026)](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423), which stratify LDL-C targets by estimated ASCVD risk:

| Risk tier                             | LDL-C goal    |
| ------------------------------------- | ------------- |
| Borderline / intermediate risk        | &lt;100 mg/dL |
| High risk                             | &lt;70 mg/dL  |
| Very high risk (secondary prevention) | &lt;55 mg/dL  |

The app does not calculate ASCVD risk score (e.g., via the AHA PREVENT equations or Pooled Cohort Equations), so it cannot select the appropriate goal tier per patient. As a result, a high-risk or secondary-prevention patient may be shown an artificially lenient "at goal" status. Risk-stratified LDL targeting is deferred to a future version.

### No medication or clinical context

The app reads observations and conditions only. It does not incorporate active medication lists, allergy records, or problem list context that would be necessary for clinical decision support in a real deployment.

### Recommended care checklist limited to diabetes

The recommended care checklist — which prompts patients to stay current on screenings and follow-up tests relevant to their condition — is currently only implemented for diabetic patients. Equivalent checklists for hypertension and hyperlipidemia are not yet implemented.
