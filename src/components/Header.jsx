import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser"); 
    setUser(storedUser ? JSON.parse(storedUser) : null);
    
  }, [location]);

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      console.log("Signing out user:", user?.email);
      await signOut(auth);
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <header className="landing-header">
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          Singhdom Animalia Rescue
        </Link>
        <div className="landing-nav-links">
          <Link to="/about">About</Link>
          <Link to="/get-involved">Get Involved</Link>
          <Link to="/contact">Contact</Link>
          {user?.role === "volunteer" ? (
            <Link to="/dashboard">Dashboard</Link>
          ) : user?.role === "admin" ? (
            <Link to="/admin">Admin Dashboard</Link>
          ) : null}

        </div>

        {user ? (
          <Link className="landing-join-btn" onClick={handleSignOut}>
            Sign Out
          </Link>
        ) : (
          <Link to="/auth" className="landing-join-btn">
            Join Us
          </Link>
        )}

        <div className="landing-mobile-menu">
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
