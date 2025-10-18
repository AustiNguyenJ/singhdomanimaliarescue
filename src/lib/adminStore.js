import { EVENTS as SEED_EVENTS, VOLUNTEERS as SEED_VOLUNTEERS } from "./adminData.js";

const KEY = "admin_store_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function ensureInit() {
  let s = load();
  if (!s) {
    s = {
      events: SEED_EVENTS,
      volunteers: SEED_VOLUNTEERS,
      assignments: [],
    };
    save(s);
  }
  return s;
}

/*Events*/
export function getEvents() {
  return ensureInit().events;
}

export function createEvent(evt) {
  const s = ensureInit();
  const id = "evt-" + Date.now();
  const newEvt = { id, ...evt };
  s.events = [newEvt, ...s.events];
  save(s);
  return newEvt;
}

export function updateEvent(id, patch) {
  const s = ensureInit();
  s.events = s.events.map(e => (e.id === id ? { ...e, ...patch } : e));
  save(s);
}

export function deleteEvent(id) {
  const s = ensureInit();
  s.events = s.events.filter(e => e.id !== id);
  s.assignments = s.assignments.filter(a => a.eventId !== id);
  save(s);
}

/*Volunteers*/
export function getVolunteers() {
  return ensureInit().volunteers;
}

/*Assignments*/
export function getAssignments() {
  return ensureInit().assignments;
}

export function isAssigned(volunteerId, eventId) {
  return ensureInit().assignments.some(a => a.volunteerId === volunteerId && a.eventId === eventId);
}

export function assignVolunteer(volunteerId, eventId) {
  const s = ensureInit();
  if (!isAssigned(volunteerId, eventId)) {
    s.assignments.push({ volunteerId, eventId });
    save(s);
  }
}

export function unassignVolunteer(volunteerId, eventId) {
  const s = ensureInit();
  s.assignments = s.assignments.filter(a => !(a.volunteerId === volunteerId && a.eventId === eventId));
  save(s);
}

export function getAssignedVolunteers(eventId) {
  const s = ensureInit();
  const ids = s.assignments.filter(a => a.eventId === eventId).map(a => a.volunteerId);
  return s.volunteers.filter(v => ids.includes(v.id));
}

export function countAssigned(eventId) {
  return getAssignedVolunteers(eventId).length;
}

export function resetStore() {
  localStorage.removeItem(KEY);
  ensureInit();
}
