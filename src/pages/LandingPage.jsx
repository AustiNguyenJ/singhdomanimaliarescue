import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'
import dogImg from '../assets/DogAndVolunteer.jpg';
import { PawPrint, Heart, Globe } from '../components/Icons';

const LandingPage = () => {
  return (
    <div className="landing-root">
      <main>
        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-hero-content">
            <h1>
              Give a Paw, Lend a Hand.
              <br />
              Change a Life.
            </h1>
            <p>
              Become a part of our compassionate community and make a lasting impact on the lives of animals in need.
            </p>
            <Link to="/auth" className="landing-cta-btn">
              Join Us
            </Link>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="landing-about">
          <div className="landing-about-content">
            <div className="landing-about-img">
              <img src={dogImg} alt="A happy dog with a volunteer" />
            </div>
            <div className="landing-about-text">
              <h2>Who We Are</h2>
              <p>
                <strong>Singhdom Animalia Rescue</strong> is a non-profit organization dedicated to rescuing, rehabilitating, and rehoming abandoned and neglected animals. Our mission is to create a world where every pet has a loving and safe home. We rely on the generosity and hard work of our amazing volunteers to achieve our goals.
              </p>
              <p>
                From walking dogs to cleaning kennels and assisting with adoption events, every volunteer role is crucial. Join us in making a real difference in the lives of our furry friends.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section id="mission" className="landing-mission">
          <div className="landing-mission-content">
            <h2>Our Volunteer Mission</h2>
            <p>
              Our dedicated volunteers are at the heart of everything we do. Here are a few ways you can help us make an impact.
            </p>
            <div className="landing-mission-cards">
              {/* Mission Card 1 */}
              <div className="landing-mission-card">
                <div className="landing-mission-icon">
                  <PawPrint />
                </div>
                <h3>Animal Care</h3>
                <p>
                  Help with daily tasks like feeding, grooming, and providing comfort to the animals in our shelter.
                </p>
              </div>
              {/* Mission Card 2 */}
              <div className="landing-mission-card">
                <div className="landing-mission-icon">
                  <Heart />
                </div>
                <h3>Adoption Events</h3>
                <p>
                  Assist at our weekly adoption events, helping families find their new best friend.
                </p>
              </div>
              {/* Mission Card 3 */}
              <div className="landing-mission-card">
                <div className="landing-mission-icon">
                  <Globe />
                </div>
                <h3>Community Outreach</h3>
                <p>
                  Spread the word about our mission through social media, fundraising, and educational programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="get-involved" className="landing-cta">
          <div className="landing-cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>
              Sign up today and start your journey as a <strong>Singhdom Animalia Rescue</strong> volunteer. We'll be in touch with more information on how you can help.
            </p>
            {/* Optionally, you can remove or keep this button. If you keep it, make it a Link to /auth */}
            <Link to="/auth" className="landing-volunteer-btn">
              Volunteer Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;