const { store, addHistory } = require("./store");

function assignVolunteers(eventId, volunteerIds, defaultHours = 2) {
  const evt = store.events.find(e => e.id === eventId);
  if (!evt) return { ok: false, error: "event-not-found" };

  const already = new Set(evt.assignedVolunteerIds || []);
  const fresh = volunteerIds.filter(id => !already.has(id));

  // respect capacity (optional)
  const remaining = Number.isFinite(evt.capacity)
    ? Math.max(0, evt.capacity - (evt.assignedVolunteerIds?.length || 0))
    : fresh.length;

  const toAssign = fresh.slice(0, remaining || fresh.length);

  evt.assignedVolunteerIds = [...(evt.assignedVolunteerIds || []), ...toAssign];

  // write to history for each assigned volunteer
  toAssign.forEach(volId => {
    addHistory({ volunteerId: volId, date: evt.date, event: evt.name, hours: defaultHours });
  });

  return { ok: true, assigned: toAssign, eventId: evt.id };
}

module.exports = { assignVolunteers };
