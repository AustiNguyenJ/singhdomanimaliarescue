import { db } from "./config";
import { collection, addDoc, getDocs, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import fs from 'fs';
import path from 'path';
import { EVENTS as SEED_EVENTS, VOLUNTEERS as SEED_VOLUNTEERS } from "./adminData.js";

/* ----------------- Generic Firestore Functions ----------------- */
export const addData = async (collectionName, data) =>
  await addDoc(collection(db, collectionName), data);

export const getData = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/* ----------------- User Profile Functions ----------------- */
export const saveUserProfile = async (data) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No logged-in user");

  const userDoc = {
    ...data,
    isAdmin: false,
    assignedTasks: [0],
    email: user.email || "",
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", user.email), userDoc, { merge: true });
};

export const getUserProfile = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No logged-in user");

  const docSnap = await getDoc(doc(db, "users", user.email));
  return docSnap.exists() ? docSnap.data() : null;
};

/* ----------------- Local JSON "Admin Store" Functions ----------------- */
const DATA_PATH = path.resolve(__dirname, './shared/data.json');

function loadStore() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStore(state) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

function ensureStore() {
  let store = loadStore();
  if (!store) {
    store = {
      events: SEED_EVENTS,
      volunteers: SEED_VOLUNTEERS,
      assignments: [],
    };
    saveStore(store);
  }
  return store;
}

/* Events */
export function getEvents() {
  return ensureStore().events;
}

export function createEvent(evt) {
  const store = ensureStore();
  const id = "evt-" + Date.now();
  const newEvt = { id, ...evt };
  store.events = [newEvt, ...store.events];
  saveStore(store);
  return newEvt;
}

export function updateEvent(id, patch) {
  const store = ensureStore();
  store.events = store.events.map(e => (e.id === id ? { ...e, ...patch } : e));
  saveStore(store);
}

export function deleteEvent(id) {
  const store = ensureStore();
  store.events = store.events.filter(e => e.id !== id);
  store.assignments = store.assignments.filter(a => a.eventId !== id);
  saveStore(store);
}

/* Volunteers */
export function getVolunteers() {
  return ensureStore().volunteers;
}

/* Assignments */
export function getAssignments() {
  return ensureStore().assignments;
}

export function isAssigned(volunteerId, eventId) {
  return ensureStore().assignments.some(a => a.volunteerId === volunteerId && a.eventId === eventId);
}

export function assignVolunteer(volunteerId, eventId) {
  const store = ensureStore();
  if (!isAssigned(volunteerId, eventId)) {
    store.assignments.push({ volunteerId, eventId });
    saveStore(store);
  }
}

export function unassignVolunteer(volunteerId, eventId) {
  const store = ensureStore();
  store.assignments = store.assignments.filter(a => !(a.volunteerId === volunteerId && a.eventId === eventId));
  saveStore(store);
}

export function getAssignedVolunteers(eventId) {
  const store = ensureStore();
  const ids = store.assignments.filter(a => a.eventId === eventId).map(a => a.volunteerId);
  return store.volunteers.filter(v => ids.includes(v.id));
}

export function countAssigned(eventId) {
  return getAssignedVolunteers(eventId).length;
}

export function resetStore() {
  fs.unlinkSync(DATA_PATH);
  ensureStore();
}
