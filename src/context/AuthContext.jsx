import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/auth.js";
import { getUserProfile } from "../firebase/firestore.js"; // import your function
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profileData = await getUserProfile();

          const data = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: profileData?.isAdmin ? "admin" : "volunteer",
            isAdmin: profileData?.isAdmin || false,
            ...profileData,
          };

          setUser(data);
          localStorage.setItem("currentUser", JSON.stringify(data)); // optional
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "volunteer" });
        }
      } else {
        setUser(null);
        localStorage.removeItem("currentUser"); // optional
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
