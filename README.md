# ROOTLINE

ROOTLINE is a simulation-first underground civilization CRPG prototype. The
first implementation target is a TypeScript web app with an ASCII/debug
presentation layer on top of a deterministic simulation core.

## Current Phase

Phase 2: cave graph and deterministic tick simulation core.

- TypeScript for the simulation and UI code.
- Node's built-in test runner for fast unit tests.
- Python's static file server for local browser preview.
- `src/sim` for simulation truth.
- `src/data` for authored seeds and scenario data.
- `src/ui` for presentation.
- `src/tests` for focused verification.

Current Phase 2 work is extending the simulation layer in small pushed rounds.
Round 1 replaces ambiguous node occupants with explicit entity references and
makes the debug graph overview data-driven.

## Commands

Install dependencies:

```sh
npm install
```

Start the debug page:

```sh
npm run dev
```

Then open:

```text
http://127.0.0.1:5173
```

Run tests:

```sh
npm test
```

Run type checks and production build:

```sh
npm run build
```

Run all local verification:

```sh
npm run verify
```

## Architecture Notes

The simulation core owns world state. UI code renders snapshots and should not
mutate core data directly. Phase 2 should extend the `src/sim` layer with a
deterministic tick engine, graph mutation rules, resource flow, stability
updates, collapse events, and seedable randomness.
