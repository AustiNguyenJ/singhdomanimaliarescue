"use client";

import React, { useEffect, useMemo, useState } from "react";
import "../../styles/admin.css";
import SkillsList from "../../components/SkillsList.jsx";

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

  // Load events & volunteers once
  useEffect(() => {
    const load = async () => {
      const evts = (await getEvents()) || [];
      const filteredEvents = evts.filter((e) => !e.deleted);
      setEvents(filteredEvents);
      if (filteredEvents.length && !eventId) setEventId(filteredEvents[0].id);

      const allVols = (await getVolunteers()) || [];
      // Filter out non-volunteer accounts if your data has isAdmin
      const vols = allVols.filter((u) => !u.isAdmin);
      setVolunteers(vols);
    };
    load();
  }, []);

  const selected = useMemo(
    () => events.find((e) => e.id === eventId) || null,
    [events, eventId]
  );

  // load assigned for a selected event
  useEffect(() => {
    if (!selected) {
      setAssigned([]);
      setAssignedCount(0);
      return;
    }

    const loadAssigned = async () => {
      const av = (await getAssignedVolunteers(selected.id)) || [];
      setAssigned(av);
      const c = (await countAssigned(selected.id)) || av.length;
      setAssignedCount(c);
    };
    loadAssigned();
  }, [selected]);

  function isAvailableForEvent(volunteer, event) {
    if (!event?.date || !event?.timeOfDay || !volunteer?.availability)
      return false;

    // Parse date without timezone shift
    const [year, month, day] = event.date.split("-").map(Number);
    const weekday = new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "long",
    });
    
    const dayAvailability = volunteer.availability[weekday];
    if (!dayAvailability) return false;

    const timeKey = Object.keys(dayAvailability).find(
      (key) => key.toLowerCase() === event.timeOfDay.toLowerCase()
    );

    return !!dayAvailability[timeKey];
  }




  // Compute matches (bestMatches and others). Exclude already-assigned volunteers from both lists.
  const { bestMatches, others } = useMemo(() => {
    if (!selected || !volunteers) return { bestMatches: [], others: [] };

    const req = new Set(selected.requiredSkills || []);
    const day = selected.date;
    const tod = selected.timeOfDay || "";

    // quick lookup for assigned IDs
    const assignedIds = new Set((assigned || []).map((a) => a.id));

    const scored = volunteers.map((v) => {
      const skills = new Set(v.skills || []);
      const overlap = [...req].filter((s) => skills.has(s)).length;
      const overlapPct = req.size === 0 ? 1 : overlap / Math.max(1, req.size);

      // robust availability check
      const available = isAvailableForEvent(v, selected)


      // preferredTimes might be undefined, array, or string
      const prefTimes =
        Array.isArray(v.preferredTimes) ? v.preferredTimes : v.preferredTimes ? [v.preferredTimes] : [];
      const timeOk = !tod || prefTimes.length === 0 || prefTimes.includes(tod);

      const already = assignedIds.has(v.id);

      const score =
        (available ? 1 : 0) * 100 + (timeOk ? 1 : 0) * 50 + Math.round(overlapPct * 10);

      return { vol: v, overlap, overlapPct, available, timeOk, score, already };
    });

    // Exclude already-assigned volunteers from match lists (they show separately in assigned list)
    const notAssigned = scored.filter((s) => !s.already);

    // bestMatches = notAssigned & available & timeOk (unless admin wants to includeUnavailable)
    const availableAndTimeOk = notAssigned.filter((s) => s.available && s.timeOk);
    availableAndTimeOk.sort((a, b) => b.score - a.score);

    // others = notAssigned & NOT (available && timeOk)
    const otherPool = notAssigned.filter((s) => !(s.available && s.timeOk));
    otherPool.sort((a, b) => b.score - a.score);

    // When includeUnavailable is false, show only availableAndTimeOk in the main table,
    // otherwise show both lists (available in main, and otherPool in Others)
    const filteredMain = includeUnavailable ? availableAndTimeOk : availableAndTimeOk;
    const filteredOthers = includeUnavailable ? otherPool : [];

    return { bestMatches: filteredMain, others: filteredOthers };
  }, [selected, volunteers, assigned, includeUnavailable]);

  // Assign/unassign handlers (keep UI in sync)
  const doAssign = async (volId) => {
    if (!selected) return;
    await assignVolunteer(volId, selected.id);
    const assignedVols = (await getAssignedVolunteers(selected.id)) || [];
    setAssigned(assignedVols);
    setAssignedCount(assignedVols.length);
  };

  const doUnassign = async (volId) => {
    if (!selected) return;
    await unassignVolunteer(volId, selected.id);
    const assignedVols = (await getAssignedVolunteers(selected.id)) || [];
    setAssigned(assignedVols);
    setAssignedCount(assignedVols.length);
  };

  // Render
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
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.date}
              </option>
            ))}
          </select>
        </div>

        {/* Event summary */}
        {selected && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              gap: 16,
              marginBottom: 18,
            }}
          >
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
                {(selected.requiredSkills || []).length === 0 ? (
                  <span className="muted">None</span>
                ) : (
                  selected.requiredSkills.map((s) => (
                    <span key={s} className="pill pill-on">{s}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div className="muted">
            Showing <strong>{bestMatches.length}</strong> match
            {bestMatches.length === 1 ? "" : "es"} •{" "}
            <button
              className="btn btn-ghost"
              onClick={() => setIncludeUnavailable((p) => !p)}
              type="button"
              title="Toggle showing volunteers who aren’t available on the date/time"
            >
              {includeUnavailable ? "Hide" : "Also show"} unavailable
            </button>
          </div>
          {selected && (
            <div className="muted">
              Assigned: <strong>{assignedCount}</strong>
            </div>
          )}
        </div>

        {/* Matches table */}
        <div className="table-wrap" style={{ marginBottom: 20 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="nowrap" style={{ width: 140 }}>Availability</th>
                <th style={{ width: 220 }}>Time Preference</th>
                <th>Skills Overlap</th>
                <th className="nowrap" style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bestMatches.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      No volunteers match the date/time filters.
                      {includeUnavailable ? "" : " Try enabling “Also show unavailable.”"}
                    </div>
                  </td>
                </tr>
              ) : (
                bestMatches.map(({ vol, available, timeOk, overlapPct }) => (
                  <tr key={vol.id}>
                    <td>
                      <strong>{vol.fullName}</strong>
                      <div className="muted">
                        <SkillsList skills={vol.skills} />
                      </div>
                    </td>
                    <td className="nowrap">
                      {selected?.date ? (
                        available ? (
                          <span className="badge badge-low">Available</span>
                        ) : (
                          <span className="badge badge-high">Not on date</span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {selected?.timeOfDay ? (
                        (Array.isArray(vol.preferredTimes) && vol.preferredTimes.length
                          ? vol.preferredTimes.join(", ")
                          : "Any time") + (timeOk ? "" : " (prefers different time)")
                      ) : (
                        Array.isArray(vol.preferredTimes) && vol.preferredTimes.length ? vol.preferredTimes.join(", ") : "Any time"
                      )}
                    </td>
                    <td>
                      {selected?.requiredSkills?.length ? (
                        <div className="muted" style={{ marginTop: 6 }}>
                          Match: {(overlapPct * 100).toFixed(0)}%
                        </div>
                      ) : null}
                    </td>
                    <td className="actions nowrap">
                      <button className="btn btn-primary" onClick={() => doAssign(vol.id)}>
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Others (not available/time) when toggled */}
        {includeUnavailable && others.length > 0 && (
          <>
            <h3 className="admin-title" style={{ fontSize: 20, marginTop: 8 }}>
              Others (not available / different time)
            </h3>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="nowrap" style={{ width: 140 }}>Availability</th>
                    <th style={{ width: 220 }}>Time Preference</th>
                    <th>Skills Overlap</th>
                    <th className="nowrap" style={{ width: 200 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {others.map(({ vol, available, timeOk, overlapPct }) => (
                    <tr key={vol.id}>
                      <td>
                        <strong>{vol.fullName}</strong>
                        <div className="muted">
                          <SkillsList skills={vol.skills} />
                        </div>
                      </td>
                      <td className="nowrap">
                        {selected?.date ? (
                          available ? (
                            <span className="badge badge-low">Available</span>
                          ) : (
                            <span className="badge badge-high">Not on date</span>
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {selected?.timeOfDay ? (
                          (Array.isArray(vol.preferredTimes) && vol.preferredTimes.length
                            ? vol.preferredTimes.join(", ")
                            : "Any time") + (timeOk ? "" : " (prefers different time)")
                        ) : (
                          Array.isArray(vol.preferredTimes) && vol.preferredTimes.length ? vol.preferredTimes.join(", ") : "Any time"
                        )}
                      </td>
                      <td>
                        {selected?.requiredSkills?.length ? (
                          <div className="muted">Match: {(overlapPct * 100).toFixed(0)}%</div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="actions nowrap">
                        <button className="btn btn-secondary" onClick={() => doAssign(vol.id)}>
                          Assign anyway
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Assigned list */}
        {selected && (
          <div className="vol-box" style={{ marginTop: 20 }}>
            <div className="vol-head">
              Assigned to <strong>{selected.name}</strong>{" "}
              <span className="muted">({assignedCount})</span>
            </div>
            {assigned.length === 0 ? (
              <div className="muted">No volunteers assigned.</div>
            ) : (
              <ul className="vol-list">
                {assigned.map((v) => (
                  <li key={v.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <strong>{v.fullName}</strong>
                    <SkillsList skills={v.skills} />
                    <button className="btn btn-ghost" onClick={() => doUnassign(v.id)} style={{ marginLeft: 8 }}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
