import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock firebase/auth
vi.mock("firebase/auth", () => {
  const mockAuthInstance = { currentUser: { email: "test@example.com" } };
  return {
    getAuth: vi.fn(() => mockAuthInstance),
    setPersistence: vi.fn(),
    browserLocalPersistence: "mockLocalPersistence",
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  };
});

// Import actual auth module and mocked firebase
import * as authModule from "../src/firebase/auth.js";
import * as firebaseAuth from "firebase/auth";

describe("auth.js", () => {
  beforeEach(() => vi.clearAllMocks());



  it("signUp calls createUserWithEmailAndPassword", async () => {
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue("signedUp");
    const res = await authModule.signUp("test@example.com", "password123");
    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      { currentUser: { email: "test@example.com" } },
      "test@example.com",
      "password123"
    );
    expect(res).toBe("signedUp");
  });

  it("login calls signInWithEmailAndPassword", async () => {
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue("loggedIn");
    const res = await authModule.login("user@test.com", "pass");
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      { currentUser: { email: "test@example.com" } },
      "user@test.com",
      "pass"
    );
    expect(res).toBe("loggedIn");
  });

  it("logout calls signOut", async () => {
    firebaseAuth.signOut.mockResolvedValue("loggedOut");
    const res = await authModule.logout();
    expect(firebaseAuth.signOut).toHaveBeenCalledWith({
      currentUser: { email: "test@example.com" },
    });
    expect(res).toBe("loggedOut");
  });
});
