const crypto = require("crypto");

const MAX_HISTORY = 100;

let history = [];

function addRecord(record = {}) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    database: record.database ?? null,
    query: record.query ?? "",
    status: record.status ?? "unknown",
    affectedRows: record.affectedRows ?? null,
    totalRows: record.totalRows ?? null,
    executionTimeMs: record.executionTimeMs ?? null,
    source: record.source ?? "manual",
  };

  if (record.prompt) {
    entry.prompt = record.prompt;
  }

  history.push(entry);

  while (history.length > MAX_HISTORY) {
    history.shift();
  }

  return entry;
}

function getHistory() {
  return [...history].reverse();
}

function clearHistory() {
  const cleared = history.length;
  history = [];
  return cleared;
}

module.exports = {
  addRecord,
  getHistory,
  clearHistory,
  MAX_HISTORY,
};
