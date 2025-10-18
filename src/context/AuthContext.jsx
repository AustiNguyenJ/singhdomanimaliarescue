import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/auth"; 
import { db } from "../firebase/config"; 
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: docSnap.data().isAdmin ? "admin" : "volunteer",
              isAdmin: docSnap.data().isAdmin || false,
              ...docSnap.data(),
            };
            setUser(data);
            localStorage.setItem("currentUser", JSON.stringify(data)); // optional
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "volunteer" });
          }
        } catch (err) {
          console.error("Error fetching user document:", err);
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
