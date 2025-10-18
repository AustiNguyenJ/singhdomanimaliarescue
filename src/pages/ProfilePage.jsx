import React, { useState, useEffect } from 'react';
import{ useNavigate } from 'react-router-dom';
import { UsaStates } from 'usa-states';
import { saveUserProfile, getUserProfile } from '../firebase/firestore';
import { getAuth } from "firebase/auth";
import { SKILLS } from '../assets/adminData.js';


const US_STATES = new UsaStates().states;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    skills: [],
    preferences: '',
    availability: {},
  });
  const [loading, setLoading] = useState(true);

  const initializeAvailability = (dataAvailability = {}) => {
    const availability = {};
    DAYS.forEach(day => {
      availability[day] = {};
      TIMES.forEach(time => {
        // Use existing value if it exists, otherwise false
        availability[day][time] = dataAvailability[day]?.[time] ?? false;
      });
    });
    return availability;
  };

  // Initialize availability and load existing profile
  useEffect(() => {
    const initializeForm = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No logged-in user!");
        setLoading(false);
        return;
      }

      try {
        let data = await getUserProfile();

        // If user document doesn't exist, create with defaults
        if (!data) {
          const defaultProfile = {
            fullName: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            skills: [],
            preferences: "",
            availability: {},
            isAdmin: false,
            assignedTasks: [0],
            email: user.email || "",
            createdAt: new Date(),
          };

          // Initialize empty availability
          DAYS.forEach(day => {
            defaultProfile.availability[day] = {};
            TIMES.forEach(time => {
              defaultProfile.availability[day][time] = false;
            });
          });

          await saveUserProfile(defaultProfile);
          data = defaultProfile;
        }

        setForm({
          fullName: data.fullName || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          skills: data.skills || [],
          preferences: data.preferences || "",
          availability: initializeAvailability(data.availability),
        });

      } catch (err) {
        console.error("Error initializing profile:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSkillChange = e => {
    const { value, checked } = e.target;
    setForm(f => ({
      ...f,
      skills: checked ? [...f.skills, value] : f.skills.filter(s => s !== value)
    }));
  };

  const handleAvailabilityChange = (day, time) => {
    setForm(f => ({
      ...f,
      availability: {
        ...f.availability,
        [day]: {
          ...f.availability[day], // if undefined, spread {} instead
          [time]: !(f.availability[day]?.[time] ?? false) // default to false
        }
      }
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await saveUserProfile(form);
      alert("Profile saved successfully!");
      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-root">
      <section className="profile-section">
        <h1 className="profile-title">Complete Your Profile</h1>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div>
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              maxLength={50}
              required
              value={form.fullName}
              onChange={handleChange}
              className="profile-input"
            />
          </div>
          <div>
            <label>Address 1 *</label>
            <input
              type="text"
              name="address1"
              maxLength={100}
              required
              value={form.address1}
              onChange={handleChange}
              className="profile-input"
            />
          </div>
          <div>
            <label>Address 2</label>
            <input
              type="text"
              name="address2"
              maxLength={100}
              value={form.address2}
              onChange={handleChange}
              className="profile-input"
            />
          </div>
          <div>
            <label>City *</label>
            <input
              type="text"
              name="city"
              maxLength={100}
              required
              value={form.city}
              onChange={handleChange}
              className="profile-input"
            />
          </div>
          <div>
            <label>State *</label>
            <select
              name="state"
              required
              value={form.state}
              onChange={handleChange}
              className="profile-input"
            >
              <option value="">Select State</option>
              {US_STATES.map((s, idx) => (
                <option key={idx} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Zip Code *</label>
            <input
              type="text"
              name="zip"
              maxLength={9}
              minLength={5}
              pattern="\d{5,9}"
              required
              value={form.zip}
              onChange={handleChange}
              className="profile-input"
            />
          </div>
          <div>
            <label>Skills *</label>
            <div className="profile-skills-checkboxes">
              {SKILLS.map(skill => (
                <label key={skill} style={{ display: 'block', marginBottom: '0.3rem' }}>
                  <input
                    type="checkbox"
                    name="skills"
                    value={skill}
                    checked={form.skills.includes(skill)}
                    onChange={handleSkillChange}
                  /> {skill}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label>Preferences</label>
            <textarea
              name="preferences"
              maxLength={500}
              value={form.preferences}
              onChange={handleChange}
              className="profile-input"
            />
          </div>
          <div>
            <label>Weekly Availability *</label>
            <div className="profile-availability-table" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {TIMES.map(time => <th key={time}>{time}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day}>
                      <td><strong>{day}</strong></td>
                      {TIMES.map(time => (
                        <td key={time}>
                          <input
                            type="checkbox"
                            checked={form.availability[day]?.[time] || false}
                            onChange={() => handleAvailabilityChange(day, time)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button type="submit" className="profile-submit-btn">Save Profile</button>
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
