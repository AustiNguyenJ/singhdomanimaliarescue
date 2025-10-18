const express = require("express");
const router = express.Router();
const { validateHistoryEntry } = require("../utils/validation");

// NEW: use the shared in-memory store instead of a local array
const { store } = require("./store");

// get all volunteer history
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: store.history,
  });
});

// post new volunteer history entry w validation
router.post("/", (req, res) => {
  const { volunteerId, date, event, hours } = req.body;

  // keep the original validator call exactly as before
  const validationError = validateHistoryEntry({ date, event, hours });
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  // make sure we have a sequence for IDs
  if (typeof store._historySeq !== "number") {
    const lastId = store.history?.[store.history.length - 1]?.id || 0;
    store._historySeq = lastId + 1;
  }

  const newEntry = {
    id: store._historySeq++,
    // volunteerId is optional for backward compatibility, but included if provided
    ...(volunteerId ? { volunteerId } : {}),
    date,
    event,
    hours,
  };

  store.history.push(newEntry);

  res.status(201).json({
    success: true,
    message: "History entry added successfully.",
    data: newEntry,
  });
});

module.exports = router;
