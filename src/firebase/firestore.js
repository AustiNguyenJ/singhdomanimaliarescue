import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

/* ----------------- Generic Firestore Functions ----------------- */
export const addData = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
  return { id: docRef.id, ...data };
};

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
    assignedTasks: [],
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

/* ----------------- Events ----------------- */
export const getEvents = async () => {
  const events = await getData("events");
  // fetch assignments and volunteers for each event
  const assignments = await getData("assignments");
  const volunteers = await getData("volunteers");

  return events.map(evt => {
    const assignedIds = assignments.filter(a => a.eventId === evt.id).map(a => a.volunteerId);
    const assignedVolunteers = volunteers.filter(v => assignedIds.includes(v.id));
    return { ...evt, assignedVolunteers };
  });
};

export const createEvent = async (evt) => {
  return await addData("events", evt);
};

export const updateEvent = async (id, patch) => {
  const docRef = doc(db, "events", id);
  await updateDoc(docRef, patch);
};

export const deleteEvent = async (id) => {
  // Soft-delete the event itself
  const eventRef = doc(db, "events", id);
  await updateDoc(eventRef, { deleted: true });

  // Soft-delete related assignments
  const assignments = await getData("assignments");
  const related = assignments.filter(a => a.eventId === id);
  for (const a of related) {
    await updateDoc(doc(db, "assignments", a.id), { deleted: true });
  }
};

/* ----------------- Volunteers ----------------- */
export const getVolunteers = async () => {
  const allUsers = await getData("users");

  const volunteers = allUsers
    .filter(u => u.isAdmin === false)
    .map(u => ({
      ...u,
      availability: Array.isArray(u.availability) ? u.availability : [],
      preferredTimes: Array.isArray(u.preferredTimes) ? u.preferredTimes : [],
      skills: Array.isArray(u.skills) ? u.skills : [],
    }));

  return volunteers;
};

/* ----------------- Assignments ----------------- */
export const getAssignments = async () => getData("assignments");

export const getAssignedVolunteers = async (eventId) => {
  const assignments = await getData("assignments");
  const volunteers = await getVolunteers(); // only non-admins
  const ids = assignments
    .filter(a => a.eventId === eventId && !a.deleted) // skip soft-deleted
    .map(a => a.volunteerId);
  return volunteers.filter(v => ids.includes(v.id));
};

export const isAssigned = async (volunteerId, eventId) => {
  const assignments = await getData("assignments");
  return assignments.some(
    a => a.eventId === eventId && a.volunteerId === volunteerId && !a.deleted
  );
};

export const assignVolunteer = async (volunteerId, eventId) => {
  const already = await isAssigned(volunteerId, eventId);
  if (!already) {
    await addData("assignments", {
      volunteerId,
      eventId,
      createdAt: serverTimestamp(),
      deleted: false,
    });
  }
};

export const unassignVolunteer = async (volunteerId, eventId) => {
  const assignments = await getData("assignments");
  const target = assignments.find(
    a => a.eventId === eventId && a.volunteerId === volunteerId && !a.deleted
  );
  if (target) {
    await updateDoc(doc(db, "assignments", target.id), { deleted: true }); // soft delete
  }
};

export const countAssigned = async (eventId) => {
  const assigned = await getAssignedVolunteers(eventId);
  return assigned.length;
};

/* ----------------- Notifications ----------------- */
export const listNotifications = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No logged-in user");

  const q = query(
    collection(db, "notifications"),
    where("audienceRoles", "array-contains", user.role || "volunteer"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createNotification = async (payload) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No logged-in user");

  const notif = {
    ...payload,
    userEmail: user.email || "anonymous",
    createdAt: serverTimestamp(),
    audienceRoles: payload.audience?.roles || ["volunteer"],
  };

  return await addData("notifications", notif);
};
