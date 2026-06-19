# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Query History subsystem** — an in-memory store (`src/store/queryHistory.js`)
  that records each executed query with its database, query text, status,
  row count, execution time, and source (`manual` or `ai`). The store is capped
  at the 100 most recent records to bound memory usage.
- **Query History REST API** — new endpoints exposed under `/api/mysql/`:
  - `GET /api/mysql/history` — retrieve all recorded query records (newest first).
  - `DELETE /api/mysql/history` — clear all recorded query records.
  - Implemented in `src/controllers/historyController.js` and
    `src/routes/historyRoutes.js`, mounted in `src/index.js`.
- **CSV/JSON export** — "Export CSV" and "Export JSON" buttons on the result grid
  that download the currently displayed rows client-side. CSV output is safely
  quoted to handle commas, quotes, and line breaks in the data.
- **`HistoryService`** — Angular service
  (`client/.../lib/services/history/history.service.ts`) wrapping the History API
  for the frontend.

### Documentation

- Added a "Query History & Export" section to `README.md` documenting the new
  API endpoints, response schema, and export behaviour.
- Added this `CHANGELOG.md`.
