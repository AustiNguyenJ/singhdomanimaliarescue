const path = require("path");
const fs = require("fs");

function loadData() {
  const jsonPath = path.join(__dirname, "..", "..", "shared", "data.json");
  try {
    const raw = fs.readFileSync(jsonPath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("[store] Failed to load shared/data.json:", e.message);
    // fall back to empty defaults so emulator still starts
    return { skills: [], events: [], volunteers: [], history: [], _historySeq: 1 };
  }
}

const data = loadData();

const store = {
  skills: data.skills || [],
  events: data.events || [],
  volunteers: data.volunteers || [],
  history: data.history || [],
  _historySeq: data._historySeq || 1
};

function addHistory({ volunteerId, date, event, hours }) {
  const entry = { id: store._historySeq++, volunteerId, date, event, hours };
  store.history.push(entry);
  return entry;
}

module.exports = { store, addHistory };