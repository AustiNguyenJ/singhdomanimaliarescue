"use client";

import React, { useEffect, useMemo, useState } from "react";
import "../../styles/admin.css";

import {
  getEvents,
  getVolunteers,
  getAssignedVolunteers,
  assignVolunteer,
  unassignVolunteer,
  countAssigned,
} from "../../firebase/firestore.js";

export default function AdminMatchingForm() {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [eventId, setEventId] = useState("");
  const [includeUnavailable, setIncludeUnavailable] = useState(false);
  const [assigned, setAssigned] = useState([]);
  const [assignedCount, setAssignedCount] = useState(0);

  // Load events and volunteers once
  useEffect(() => {
    const loadData = async () => {
      const evts = await getEvents();
      const filteredEvents = (evts || []).filter(evt => !evt.deleted);
      setEvents(filteredEvents);
      if (filteredEvents.length) setEventId(filteredEvents[0].id);

      const allUsers = await getVolunteers();
      // Filter only volunteers (isAdmin === false)
      const vols = (allUsers || []).filter(u => !u.isAdmin);
      setVolunteers(vols);
    };
    loadData();
  }, []);

  const selected = useMemo(
    () => events.find((e) => e.id === eventId) || null,
    [events, eventId]
  );

  // Load assigned volunteers for selected event
  useEffect(() => {
    if (!selected) return;

    const loadAssigned = async () => {
      const assignedVols = await getAssignedVolunteers(selected.id);
      setAssigned(assignedVols || []);
      const count = await countAssigned(selected.id);
      setAssignedCount(count);
    };

    loadAssigned();
  }, [selected, volunteers]);

  // Compute best matches and others
  const { bestMatches, others } = useMemo(() => {
    if (!selected) return { bestMatches: [], others: [] };

    const reqSkills = new Set(selected.requiredSkills || []);
    const day = selected.date;
    const tod = selected.timeOfDay || "";

    const scored = volunteers.map((v) => {
      const skills = new Set(v.skills || []);
      const overlap = [...reqSkills].filter(s => skills.has(s)).length;
      const overlapPct = reqSkills.size === 0 ? 1 : overlap / reqSkills.size;

      // Availability check for nested map structure
      const available =
        tod && v.availability?.[day]
          ? v.availability[day][tod] === true
          : Object.values(v.availability?.[day] || {}).some(Boolean);

      const prefTimes = Array.isArray(v.preferredTimes) ? v.preferredTimes : [];
      const timeOk = !tod || prefTimes.includes(tod);

      const alreadyAssigned = assigned.some(a => a.id === v.id);

      const score =
        (available ? 1 : 0) * 100 +
        (timeOk ? 1 : 0) * 50 +
        Math.round(overlapPct * 10);

      return {
        vol: v,
        overlap,
        overlapPct,
        available,
        timeOk,
        score,
        already: alreadyAssigned,
      };
    });

    const filtered = scored.filter(s => includeUnavailable ? true : s.available && s.timeOk);
    filtered.sort((a, b) => b.score - a.score);

    const otherPool = includeUnavailable
      ? scored.filter(s => !(s.available && s.timeOk))
      : [];
    otherPool.sort((a, b) => b.score - a.score);

    return { bestMatches: filtered, others: otherPool };
  }, [selected, volunteers, assigned, includeUnavailable]);

  // Assign / Unassign handlers
  const doAssign = async (volId) => {
    if (!selected) return;
    await assignVolunteer(volId, selected.id);
    const assignedVols = await getAssignedVolunteers(selected.id);
    setAssigned(assignedVols || []);
    setAssignedCount(assignedVols.length);
  };

  const doUnassign = async (volId) => {
    if (!selected) return;
    await unassignVolunteer(volId, selected.id);
    const assignedVols = await getAssignedVolunteers(selected.id);
    setAssigned(assignedVols || []);
    setAssignedCount(assignedVols.length);
  };

  if (!events.length) {
    return (
      <main className="admin-root">
        <section className="admin-card">
          <h1 className="admin-title">Volunteer Matching</h1>
          <div className="empty-state">
            No events yet. Create one from the Admin Dashboard.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-root">
      <section className="admin-card">
        <h1 className="admin-title">Volunteer Matching</h1>

        {/* Event picker */}
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="evt">Select Event</label>
          <select
            id="evt"
            className="in"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            {events.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.date}
              </option>
            ))}
          </select>
        </div>

        {/* Event summary */}
        {selected && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div className="vol-box">
              <div className="vol-head">Event</div>
              <div><strong>{selected.name}</strong></div>
              <div className="muted">{selected.location}</div>
              <div className="muted">
                {selected.date} {selected.timeOfDay ? `• ${selected.timeOfDay}` : ""}
              </div>
            </div>
            <div className="vol-box">
              <div className="vol-head">Urgency</div>
              <span className={`badge badge-${(selected.urgency || "low").toLowerCase()}`}>
                {selected.urgency || "Low"}
              </span>
            </div>
            <div className="vol-box">
              <div className="vol-head">Required Skills</div>
              <div className="pill-grid readonly">
                {(selected.requiredSkills || []).length === 0
                  ? <span className="muted">None</span>
                  : selected.requiredSkills.map(s => <span key={s} className="pill pill-on">{s}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="muted">
            Showing <strong>{bestMatches.length}</strong> match{bestMatches.length === 1 ? "" : "es"} •{" "}
            <button
              className="btn btn-ghost"
              onClick={() => setIncludeUnavailable(p => !p)}
              type="button"
              title="Toggle showing volunteers who aren’t available on the date/time"
            >
              {includeUnavailable ? "Hide" : "Also show"} unavailable
            </button>
          </div>
          {selected && <div className="muted">Assigned: <strong>{assignedCount}</strong></div>}
        </div>

        {/* Assigned list */}
        {selected && (
          <div className="vol-box" style={{ marginTop: 20 }}>
            <div className="vol-head">
              Assigned to <strong>{selected.name}</strong> <span className="muted">({assignedCount})</span>
            </div>
            {assigned.length === 0
              ? <div className="muted">No volunteers assigned.</div>
              : <ul className="vol-list">
                  {assigned.map(v => (
                    <li key={v.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <strong>{v.name}</strong>
                      <span className="muted">— {v.skills.join(", ")}</span>
                      <button className="btn btn-ghost" onClick={() => doUnassign(v.id)} style={{ marginLeft: 8 }}>Remove</button>
                    </li>
                  ))}
                </ul>
            }
          </div>
        )}
      </section>
    </main>
  );
}
