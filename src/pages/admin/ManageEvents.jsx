// src/pages/admin/ManageEvents.jsx
import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

import {
  getEvents,
  updateEvent,
  deleteEvent,
  countAssigned,
  getAssignedVolunteers,
} from "../../firebase/firestore.js";

import { SKILLS, URGENCY, TIME_OF_DAY } from "../../firebase/adminData.js";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({
    name: "",
    description: "",
    location: "",
    requiredSkills: [],
    urgency: "",
    date: "",
    timeOfDay: "",
  });
  const [openVolunteersFor, setOpenVolunteersFor] = useState(null);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const startEdit = (evt) => {
    setEditId(evt.id);
    setEdit({
      name: evt.name || "",
      description: evt.description || "",
      location: evt.location || "",
      requiredSkills: Array.isArray(evt.requiredSkills) ? evt.requiredSkills : [],
      urgency: evt.urgency || "",
      date: evt.date || "",
      timeOfDay: evt.timeOfDay || "",
    });
  };

  const cancelEdit = () => setEditId(null);

  const saveEdit = () => {
    updateEvent(editId, { ...edit, requiredSkills: [...edit.requiredSkills] });
    setEvents(getEvents());
    setEditId(null);
  };

  const remove = (id) => {
    if (!confirm("Delete this event?")) return;
    deleteEvent(id);
    setEvents(getEvents());
  };

  const toggleVolunteers = (eventId) =>
    setOpenVolunteersFor((p) => (p === eventId ? null : eventId));

  const handleSkillToggle = (skill) => {
    setEdit((e) => {
      const on = e.requiredSkills.includes(skill);
      return {
        ...e,
        requiredSkills: on
          ? e.requiredSkills.filter((s) => s !== skill)
          : [...e.requiredSkills, skill],
      };
    });
  };

  return (
    <main className="admin-root">
      <section className="admin-card">
        <h1 className="admin-title">Manage Events</h1>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events yet. Create one from the Admin Dashboard.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="nowrap" style={{ width: 150 }}>Date</th>
                  <th className="nowrap" style={{ width: 140 }}>Time</th>
                  <th className="nowrap" style={{ width: 120 }}>Urgency</th>
                  <th>Location</th>
                  <th>Required Skills</th>
                  <th className="nowrap" style={{ width: 140 }}>Assigned</th>
                  <th className="nowrap" style={{ width: 210 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const isEditing = editId === evt.id;
                  const volunteersOpen = openVolunteersFor === evt.id;

                  return (
                    <React.Fragment key={evt.id}>
                      <tr>
                        {/* Name */}
                        <td>
                          {isEditing ? (
                            <input
                              className="in"
                              value={edit.name}
                              onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                            />
                          ) : (
                            <strong>{evt.name}</strong>
                          )}
                        </td>

                        {/* Date */}
                        <td className="nowrap">
                          {isEditing ? (
                            <input
                              className="in"
                              type="date"
                              value={edit.date}
                              onChange={(e) => setEdit({ ...edit, date: e.target.value })}
                            />
                          ) : (
                            evt.date
                          )}
                        </td>

                        {/* Time of Day */}
                        <td className="nowrap">
                          {isEditing ? (
                            <select
                              className="in"
                              value={edit.timeOfDay}
                              onChange={(e) => setEdit({ ...edit, timeOfDay: e.target.value })}
                            >
                              <option value="">Select…</option>
                              {TIME_OF_DAY.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          ) : (
                            evt.timeOfDay || "—"
                          )}
                        </td>

                        {/* Urgency */}
                        <td className="nowrap">
                          {isEditing ? (
                            <select
                              className="in"
                              value={edit.urgency}
                              onChange={(e) => setEdit({ ...edit, urgency: e.target.value })}
                            >
                              <option value="">Select…</option>
                              {URGENCY.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`badge badge-${(evt.urgency || "low").toLowerCase()}`}>
                              {evt.urgency}
                            </span>
                          )}
                        </td>

                        {/* Location */}
                        <td>
                          {isEditing ? (
                            <input
                              className="in"
                              value={edit.location}
                              onChange={(e) => setEdit({ ...edit, location: e.target.value })}
                            />
                          ) : (
                            <span className="muted">{evt.location}</span>
                          )}
                        </td>

                        {/* Required Skills */}
                        <td className="skills-cell">
                          {isEditing ? (
                            <div className="pill-grid">
                              {SKILLS.map((s) => {
                                const on = edit.requiredSkills.includes(s);
                                return (
                                  <button
                                    type="button"
                                    key={s}
                                    className={`pill ${on ? "pill-on" : ""}`}
                                    onClick={() => handleSkillToggle(s)}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="pill-grid compact readonly">
                              {(evt.requiredSkills || []).map((s) => (
                                <span key={s} className="pill pill-muted">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Assigned */}
                        <td className="nowrap">
                          <button className="btn btn-ghost" onClick={() => toggleVolunteers(evt.id)}>
                            {countAssigned(evt.id)} volunteer(s)
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="actions nowrap">
                          <span className="btn-row">
                            {isEditing ? (
                              <>
                                <button className="btn btn-primary" onClick={saveEdit}>
                                  Save
                                </button>
                                <button className="btn btn-secondary" onClick={cancelEdit}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-secondary" onClick={() => startEdit(evt)}>
                                  Edit
                                </button>
                                <button className="btn btn-danger" onClick={() => remove(evt.id)}>
                                  Delete
                                </button>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>

                      {volunteersOpen && (
                        <tr className="vol-row">
                          <td colSpan={8}>
                            <div className="vol-box">
                              <div className="vol-head">
                                Assigned volunteers for <strong>{evt.name}</strong>
                              </div>
                              {getAssignedVolunteers(evt.id).length === 0 ? (
                                <div className="muted">No volunteers assigned.</div>
                              ) : (
                                <ul className="vol-list">
                                  {getAssignedVolunteers(evt.id).map((v) => (
                                    <li key={v.id}>
                                      <strong>{v.name}</strong>
                                      <span className="muted"> — {v.skills.join(", ")}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
