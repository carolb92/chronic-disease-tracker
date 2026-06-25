# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A SMART on FHIR patient-facing app for tracking chronic disease management across three conditions: Diabetes (DM), Hypertension (HTN), and Hyperlipidemia (HLD). It launches via the SMART OAuth2 flow, reads FHIR resources (Patient, Condition, Observation), and evaluates HEDIS quality measures.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check with `tsc -b` then bundle with Vite
- `npm run lint` — ESLint
- `npx shadcn add <component>` — add ShadCN UI components (style: radix-nova)

There is no test runner configured.

## Architecture

**SMART on FHIR launch flow:**
`/instructions` (landing page) → `/launch` (triggers `FHIR.oauth2.authorize`) → `/app` (redirect URI, main app). The `fhirclient` library handles the OAuth2 handshake; the app requests `patient/*.read` scope.

**Data pipeline (`useFHIRResources` hook):**
The single hook fetches Patient, Condition, and Observation resources in parallel after OAuth2 completes. It then:
1. Filters conditions to those matching `TRACKED_CONDITION_SNOMED_CODES`
2. Maps SNOMED codes → LOINC codes via `SNOMED_TO_LOINC` to find relevant observations
3. Groups/sorts observations for display
4. Runs HEDIS measure evaluation for diabetes patients (`lib/hedis.ts`)

**Clinical code mappings (`lib/constants.ts`):**
All clinical terminology lives here. SNOMED codes identify conditions; LOINC codes identify lab/vital observations. The `SNOMED_TO_LOINC` map drives which observations are fetched per condition. Disease-group arrays (`DM_SNOMED_CODES`, `HTN_SNOMED_CODES`, `HLD_SNOMED_CODES`) control which UI tabs render.

**UI structure:**
- `components/ui/` — ShadCN primitives (don't edit manually)
- `components/AppPage/` — app page feature components
- `components/Instructions/` — landing page components
- `components/global/` — shared components

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, ShadCN (radix-nova style), Recharts, react-router v7. Path alias: `@/` → `src/`.

## FHIR Types

Use `fhir4.*` types from `@types/fhir` (e.g., `fhir4.Patient`, `fhir4.Observation`). These are globally available without import.
