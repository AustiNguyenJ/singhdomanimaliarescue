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
import { getAuth } from 'firebase/auth';
import * as firestore from "./firestore.js"

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

  // inside saveUserProfile
  await firestore.setDoc(firestore.doc(db, "users", user.email), userDoc, { merge: true });

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
      availability:
        u.availability && typeof u.availability === "object"
          ? u.availability
          : {},
      preferredTimes: Array.isArray(u.preferredTimes) ? u.preferredTimes : [],
      skills: Array.isArray(u.skills) ? u.skills : [],
    }));

  return volunteers;
};


/* ----------------- Assignments ----------------- */

export const getAssignedVolunteers = async (eventId) => {
  const events = await getData("events");
  const event = events.find(e => e.id === eventId);
  if (!event || !Array.isArray(event.assignedVolunteers)) return [];

  const volunteers = await getVolunteers();
  return volunteers.filter(v => event.assignedVolunteers.includes(v.email));
};

export const assignVolunteer = async (volunteerEmail, eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const snapshot = await getDoc(eventRef);
    if (!snapshot.exists()) throw new Error("Event not found");

    const eventData = snapshot.data();
    const assigned = Array.isArray(eventData.assignedVolunteers) ? eventData.assignedVolunteers : [];

    if (!assigned.includes(volunteerEmail)) {
      assigned.push(volunteerEmail);
      await updateDoc(eventRef, { assignedVolunteers: assigned });
    }

    // Create notification
    await firestore.createNotification({
      title: "New Event Assignment",
      message: `You have been assigned to the event: "${eventData.name || "Unnamed Event"}"`,
      eventId,
      userEmail: volunteerEmail,
      audience: { roles: ["volunteer"] },
      deleted: false,
    });
  } catch (err) {
    console.error("Failed to assign volunteer:", err);
    throw err;
  }
};

export const unassignVolunteer = async (volunteerEmail, eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const snapshot = await getDoc(eventRef);
    if (!snapshot.exists()) throw new Error("Event not found");

    const eventData = snapshot.data();
    const updated = Array.isArray(eventData.assignedVolunteers)
      ? eventData.assignedVolunteers.filter(e => e !== volunteerEmail)
      : [];
    await updateDoc(eventRef, { assignedVolunteers: updated });

    // Mark notifications as deleted
    const notifQuery = query(
      collection(db, "notifications"),
      where("eventId", "==", eventId),
      where("userEmail", "==", volunteerEmail),
      where("deleted", "==", false)
    );
    const notifSnapshot = await getDocs(notifQuery);

    for (const docSnap of notifSnapshot.docs) {
      await updateDoc(doc(db, "notifications", docSnap.id), { deleted: true });
    }
  } catch (err) {
    console.error("Failed to unassign volunteer:", err);
    throw err;
  }
};

export const countAssigned = async (eventId) => {
  const eventRef = doc(db, "events", eventId);
  const snapshot = await getDoc(eventRef);
  const data = snapshot.exists() ? snapshot.data() : {};
  return Array.isArray(data.assignedVolunteers) ? data.assignedVolunteers.length : 0;
};

/* ----------------- Notifications ----------------- */
export const listNotifications = async (userEmail, role = "volunteer") => {
  if (!userEmail) return [];

  const q = query(
    collection(db, "notifications"),
    where("audienceRoles", "array-contains", role),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(notif => !notif.deleted); // filter out deleted notifications
};



export const createNotification = async (payload) => {
  try {
    const notif = {
      ...payload,
      userEmail: payload.userEmail || "anonymous",
      audienceRoles: payload.audience?.roles || ["volunteer"],
      deleted: payload.deleted || false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "notifications"), notif);
    console.log("Notification created with ID:", docRef.id);
    return { id: docRef.id, ...notif };
  } catch (err) {
    console.error("Failed to create notification:", err);
    throw err;
  }
};


/* ----------------- Volunteer History ----------------- */
export const getVolunteerEvents = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No logged-in user");

  const allEventsSnapshot = await getDocs(
    query(collection(db, "events"), orderBy("createdAt", "desc"))
  );

  const allEvents = allEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filter events where the user is assigned
  const assignedEvents = allEvents.filter(event => {
    return Array.isArray(event.assignedVolunteers) && event.assignedVolunteers.includes(user.email);
  });

  return assignedEvents;
};

export { setDoc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, doc, collection };