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