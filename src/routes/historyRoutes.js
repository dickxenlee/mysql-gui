const express = require("express");
const historyController = require("../controllers/historyController");
const historyRouter = express.Router();

historyRouter.get("/history", historyController.getHistory);
historyRouter.delete("/history", historyController.clearHistory);

module.exports = historyRouter;
