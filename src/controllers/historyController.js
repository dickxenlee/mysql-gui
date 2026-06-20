const queryHistory = require("../store/queryHistory");

// GET /api/mysql/history → return all recorded query-history entries
const getHistory = (req, res) => {
  try {
    const history = queryHistory.getHistory();
    res.status(200).json({ history });
  } catch (err) {
    console.error("Error fetching query history:", err);
    res.status(500).json({ error: "Error fetching query history" });
  }
};

// DELETE /api/mysql/history → clear all recorded entries
const clearHistory = (req, res) => {
  try {
    queryHistory.clearHistory();
    res.status(200).json({ message: "Query history cleared successfully" });
  } catch (err) {
    console.error("Error clearing query history:", err);
    res.status(500).json({ error: "Error clearing query history" });
  }
};

module.exports = {
  getHistory,
  clearHistory,
};
