// src/components/EventForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

import { SKILLS, URGENCY, TIME_OF_DAY } from "../lib/adminData.js";
import { createEvent } from "../lib/adminStore.js";

const maxLen = (s, n) => (s || "").trim().length <= n;

export default function EventForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    skills: [],       // UI field; saved as requiredSkills
    urgency: "",
    date: "",
    timeOfDay: "",    // NEW
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const el = document.getElementById("evt-name");
    if (el) el.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    setForm((f) => ({
      ...f,
      skills: checked ? [...f.skills, value] : f.skills.filter((s) => s !== value),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Event Name is required.";
    else if (!maxLen(form.name, 100)) newErrors.name = "Event Name must be ≤ 100 characters.";
    if (!form.description.trim()) newErrors.description = "Event Description is required.";
    if (!form.location.trim()) newErrors.location = "Location is required.";
    if (form.skills.length === 0) newErrors.skills = "Please select at least one skill.";
    if (!form.urgency) newErrors.urgency = "Please choose an urgency.";
    if (!form.date) newErrors.date = "Please select a date.";
    if (!form.timeOfDay) newErrors.timeOfDay = "Please select a time of day."; // NEW
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Optional notification stub so your Notifications page can display something
  async function createNotificationFromEvent(evt) {
    const notification = {
      id: (window.crypto?.randomUUID?.() || String(Date.now())),
      createdAt: new Date().toISOString(),
      subject: `${evt.name} (${evt.urgency}${evt.timeOfDay ? ` • ${evt.timeOfDay}` : ""})`,
      to: evt.skills.length ? evt.skills.join(", ") : "All Volunteers",
      body: `${evt.description}`,
    };
    const list = JSON.parse(localStorage.getItem("notifications") || "[]");
    list.unshift(notification);
    localStorage.setItem("notifications", JSON.stringify(list));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Save to mock store (so Manage Events + Matching can use it)
    createEvent({
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      requiredSkills: [...form.skills],
      urgency: form.urgency,
      date: form.date,
      timeOfDay: form.timeOfDay, // NEW
    });

    createNotificationFromEvent(form).catch(() => {});

    // Reset & go to Manage Events
    setForm({
      name: "",
      description: "",
      location: "",
      skills: [],
      urgency: "",
      date: "",
      timeOfDay: "",
    });
    setErrors({});
    navigate("/admin/events/manage");
  };

  return (
    <div className="admin-page">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Create Event</h2>

        <form onSubmit={handleSubmit} className="event-form" noValidate>
          {/* Event Name */}
          <div className="field">
            <label htmlFor="evt-name">Event Name *</label>
            <input
              id="evt-name"
              type="text"
              name="name"
              maxLength={100}
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Max 100 characters"
            />
            <div className="help">{form.name.length}/100</div>
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          {/* Event Description */}
          <div className="field">
            <label htmlFor="evt-description">Event Description *</label>
            <textarea
              id="evt-description"
              name="description"
              required
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the event goals, logistics, etc."
            />
            {errors.description && <div className="error">{errors.description}</div>}
          </div>

          {/* Location */}
          <div className="field">
            <label htmlFor="evt-location">Location *</label>
            <textarea
              id="evt-location"
              name="location"
              required
              rows={3}
              value={form.location}
              onChange={handleChange}
              placeholder="Address, venue, or meeting point"
            />
            {errors.location && <div className="error">{errors.location}</div>}
          </div>

          {/* Required Skills */}
          <div className="field">
            <label>Required Skills *</label>
            <div className="check-grid">
              {SKILLS.map((skill) => (
                <label key={skill} className="check-pill">
                  <input
                    type="checkbox"
                    name="skills"
                    value={skill}
                    checked={form.skills.includes(skill)}
                    onChange={handleSkillChange}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
            {errors.skills && <div className="error">{errors.skills}</div>}
          </div>

          {/* Urgency */}
          <div className="field">
            <label htmlFor="evt-urgency">Urgency *</label>
            <select
              id="evt-urgency"
              name="urgency"
              required
              value={form.urgency}
              onChange={handleChange}
            >
              <option value="">Select urgency…</option>
              {URGENCY.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {errors.urgency && <div className="error">{errors.urgency}</div>}
          </div>

          {/* Event Date */}
          <div className="field">
            <label htmlFor="evt-date">Event Date *</label>
            <input
              id="evt-date"
              type="date"
              name="date"
              required
              value={form.date}
              onChange={handleChange}
            />
            {errors.date && <div className="error">{errors.date}</div>}
          </div>

          {/* Time of Day */}
          <div className="field">
            <label>Time of Day *</label>
            <div className="pill-grid">
              {TIME_OF_DAY.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`pill ${form.timeOfDay === t ? "pill-on" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, timeOfDay: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.timeOfDay && <div className="error">{errors.timeOfDay}</div>}
          </div>

          {/* Submit */}
          <div className="actions" style={{ marginTop: "0.75rem" }}>
            <button type="submit">Create Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}
