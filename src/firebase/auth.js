import { getAuth, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);



export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const initAuth = () => {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);
  return auth;
};