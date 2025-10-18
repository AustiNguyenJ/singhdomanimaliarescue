// src/pages/admin/ManageEvents.jsx
"use client";

import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

import {
  getEvents,
  updateEvent,
  deleteEvent,
  getAssignedVolunteers,
} from "../../firebase/firestore.js";

import { SKILLS, URGENCY, TIME_OF_DAY } from "../../assets/adminData.js";

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
  const [assignedVols, setAssignedVols] = useState({}); // { eventId: [vols] }
  const [assignedCounts, setAssignedCounts] = useState({}); // { eventId: count }

  // Load events on mount
  useEffect(() => {
    const loadEvents = async () => {
      const evts = await getEvents();
      const filtered = (evts || []).filter(evt => !evt.deleted);
      setEvents(filtered);
      // load counts for all events
      const counts = {};
      for (const evt of evts || []) {
        const vols = evt.assignedVolunteers || [];
        counts[evt.id] = vols.length;
      }
      setAssignedCounts(counts);
    };
    loadEvents();
  }, []);

  // Edit handlers
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

  const saveEdit = async () => {
    await updateEvent(editId, { ...edit, requiredSkills: [...edit.requiredSkills] });
    const evts = await getEvents();
    const filtered = (evts || []).filter(evt => !evt.deleted);
    setEvents(filtered);
    setEditId(null);

    // update counts
    const counts = {};
    for (const evt of evts || []) {
      counts[evt.id] = (evt.assignedVolunteers || []).length;
    }
    setAssignedCounts(counts);
  };

  const remove = async (id) => {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(id);
    const evts = await getEvents();
    const filtered = (evts || []).filter(evt => !evt.deleted);
    setEvents(filtered);

    // update counts
    setAssignedCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[id];
      return newCounts;
    });
  };

  // Toggle volunteers list and fetch assigned volunteers
  const toggleVolunteers = async (eventId) => {
    if (openVolunteersFor === eventId) {
      setOpenVolunteersFor(null);
      return;
    }
    const vols = await getAssignedVolunteers(eventId);
    setAssignedVols((prev) => ({ ...prev, [eventId]: vols }));
    setAssignedCounts((prev) => ({ ...prev, [eventId]: vols.length }));
    setOpenVolunteersFor(eventId);
  };

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
                                <option key={t} value={t}>{t}</option>
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
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`badge badge-${(evt.urgency || "low").toLowerCase()}`}>
                              {evt.urgency || "Low"}
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
                                <span key={s} className="pill pill-muted">{s}</span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Assigned */}
                        <td className="nowrap">
                          <button className="btn btn-ghost" onClick={() => toggleVolunteers(evt.id)}>
                            {assignedCounts[evt.id] ?? 0} volunteer(s)
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="actions nowrap">
                          <span className="btn-row">
                            {isEditing ? (
                              <>
                                <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                                <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-secondary" onClick={() => startEdit(evt)}>Edit</button>
                                <button className="btn btn-danger" onClick={() => remove(evt.id)}>Delete</button>
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
                              {(!assignedVols[evt.id] || assignedVols[evt.id].length === 0) ? (
                                <div className="muted">No volunteers assigned.</div>
                              ) : (
                                <ul className="vol-list">
                                  {assignedVols[evt.id].map(v => (
                                    <li key={v.id}>{v.name}</li>
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
