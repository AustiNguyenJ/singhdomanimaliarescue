 import React from 'react';
 import { Link } from 'react-router-dom';


const Footer = () => (
  <footer className="landing-footer">
    <div className="landing-footer-content">
      <p>&copy; {new Date().getFullYear()} <strong>Singhdom Animalia Rescue</strong>. All rights reserved.</p>
      <div className="landing-footer-links">
        <Link to="/admin">Employee Login</Link>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </footer>
);

export default Footer;