import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;          // wait for Firebase to check session
  if (!user) return <Navigate to="/auth" replace />;  // 🚫 redirect to login if no user

  return children;                                // ✅ render the protected page
}
