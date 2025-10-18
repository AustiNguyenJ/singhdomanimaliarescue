const express = require("express");
const router = express.Router();
const { store } = require("./store");
const { assignVolunteers } = require("./matching");

router.get("/events/:eventId/candidates", (req, res) => {
  const evt = store.events.find(e => e.id === req.params.eventId);
  if (!evt) return res.status(404).json({ error: "event not found" });

  const need = new Set(evt.requiredSkills || []);
  const candidates = store.volunteers.filter(v => v.skills?.some(s => need.has(s)));
  res.json({ data: candidates });
});

router.post("/events/:eventId/assign", (req, res) => {
  const { volunteerIds = [], hours = 2 } = req.body || {};
  const result = assignVolunteers(req.params.eventId, volunteerIds, hours);
  if (!result.ok) return res.status(404).json({ error: result.error });
  res.json(result);
});

module.exports = router;
