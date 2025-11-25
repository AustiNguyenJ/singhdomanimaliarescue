import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export async function fetchEvents() {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}