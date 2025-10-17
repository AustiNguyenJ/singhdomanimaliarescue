import { db } from "./config";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const addData = async (collectionName, data) =>
  await addDoc(collection(db, collectionName), data);

export const getData = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


// Create or update a user's profile
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

  await setDoc(doc(db, "users", user.uid), userDoc, { merge: true });
};

// Fetch a user's profile
export const getUserProfile = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No logged-in user");

  const docSnap = await getDoc(doc(db, "users", user.uid));
  return docSnap.exists() ? docSnap.data() : null;
};


// notifications 
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function authHeader() {
  const auth = getAuth();
  const u = auth.currentUser;
  if (!u) throw new Error("No logged-in user");
  const token = await u.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

// GET list notifications visible to the current user
export const getNotifications = async () => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}/notifications`, { headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`GET /notifications ${res.status} ${msg}`);
  }
  return res.json();
};

// POST admin creates a notification
export const sendNotification = async (payload) => {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/notifications`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`POST /notifications ${res.status} ${msg}`);
  }
  return res.json();
};

// admin sends an event update
export const sendNotificationUpdate = async (payload) => {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/notifications/update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`POST /notifications/update ${res.status} ${msg}`);
  }
  return res.json();
};

// admin sends an event reminder
export const sendNotificationReminder = async (payload) => {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/notifications/reminder`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`POST /notifications/reminder ${res.status} ${msg}`);
  }
  return res.json();
};

// mark a notification as read for the current user
export const markNotificationRead = async (id) => {
  const headers = { ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`PATCH /notifications/${id}/read ${res.status} ${msg}`);
  }
  return res.json();
};