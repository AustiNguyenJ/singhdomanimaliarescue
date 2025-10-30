import { vi } from "vitest";

const mockAuthInstance = { currentUser: { email: "test@example.com" } };

export const getAuth = vi.fn(() => mockAuthInstance);
export const setPersistence = vi.fn();
export const browserLocalPersistence = "mockLocalPersistence";
export const createUserWithEmailAndPassword = vi.fn();
export const signInWithEmailAndPassword = vi.fn();
export const signOut = vi.fn();
