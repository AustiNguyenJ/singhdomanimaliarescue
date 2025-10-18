import React, { useEffect,useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, login } from '../firebase/auth'; 
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  const handleSubmit = async e => {
    e.preventDefault();

    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      if (isSignup) {
        await signUp(form.email, form.password);
        alert('Signup successful!');
      } else {
        await login(form.email, form.password);
        alert('Login successful!');
      }
      setForm({ email: '', password: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      if (user.isAdmin) navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, loading, navigate]);


  return (
    <div className="auth-root">
      <section className="auth-section">
        <h1 className="auth-title">{isSignup ? 'Sign Up' : 'Log In'}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              className="auth-input"
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              className="auth-input"
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn">
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <div className="auth-toggle">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsSignup(false)} className="auth-toggle-btn">
                Log In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button onClick={() => setIsSignup(true)} className="auth-toggle-btn">
                Sign Up
              </button>
            </>
          )}
        </div>
        <div className="auth-actions">
          <Link to="/" className="auth-home-link">
            Go back to the home page
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
