 import React from 'react';
 import { Link } from 'react-router-dom';

 const Header = () => (
   <header className="landing-header">
     <nav className="landing-nav">
       <Link to="/" className="landing-logo">
         Singhdom Animalia Rescue
       </Link>
       <div className="landing-nav-links">
         <Link to="/about">About</Link>
         {/*<a href="#mission">Our Mission*/}
         <Link to="/get-involved">Get Involved</Link>
         <Link to="/contact">Contact</Link>
       </div>
       <Link to="/get-involved" className="landing-join-btn">
         Join Us
       </Link>
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


 export default Header;