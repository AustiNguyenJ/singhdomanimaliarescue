import React from "react";
import { Link } from "react-router-dom";
import hero from "../assets/DogAndVolunteer.jpg";

function GetInvolvedPage() {
  return (
    <main className="about-root">
      <section className="about-section">
        <img
          src={hero}
          alt="Volunteer with rescue dog"
          style={{ maxWidth: 780, width: "100%", borderRadius: 12, margin: "0 auto 1rem" }}
        />

        <h1 className="about-title">Get Involved</h1>
        <p className="about-description">
          Help out by volunteering, fostering, or donating supplies/funds. Every bit makes a difference.
        </p>

        <div className="about-mission">
          <h2 className="about-subtitle">{/* <PawPrint /> */} Volunteer</h2>
          <p>Assist at adoption events, transport animals, or help with admin tasks.</p>
          <div className="about-actions">
            <Link to="/auth" className="about-contact-link">Sign up / Log in</Link>
            <Link to="/profile" className="about-contact-link">Complete your profile</Link>
          </div>
        </div>

        <div className="about-mission">
          <h2 className="about-subtitle">{/* <Heart /> */} Foster</h2>
          <p>Short-term fosters save lives. Tell us your availability and experience.</p>
          <a
            className="about-contact-link"
            href="https://forms.gle/example"
            target="_blank"
            rel="noreferrer"
          >
            Foster interest form
          </a>
        </div>

        <div className="about-team">
          <h2 className="about-subtitle">{/* <Globe /> */} Donate</h2>
          <ul className="about-team-list">
            <li>Wishlist: food, crates, cleaning supplies</li>
            <li>Monetary donations cover vet care and transport</li>
          </ul>
          <a
            className="about-contact-link"
            href="https://donate.example.org"
            target="_blank"
            rel="noreferrer"
          >
            Donate online
          </a>
        </div>

        <div className="about-actions">
          <Link to="/contact" className="about-contact-link">Questions? Contact us</Link>
        </div>
      </section>
    </main>
  );
}

export default GetInvolvedPage;