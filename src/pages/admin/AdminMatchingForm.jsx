import React, { useEffect, useMemo, useState } from "react";
import "../../styles/admin.css";

import {
  getEvents,
  getVolunteers,
  getAssignedVolunteers,
  isAssigned,
  assignVolunteer,
  unassignVolunteer,
  countAssigned,
} from "../../firebase/firestore.js";

import { TIME_OF_DAY } from "../../firebase/adminData.js";

export default function AdminMatchingForm() {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [eventId, setEventId] = useState("");
  const [includeUnavailable, setIncludeUnavailable] = useState(false);

  // load once
  useEffect(() => {
    const evts = getEvents();
    setEvents(evts);
    setVolunteers(getVolunteers());
    if (evts.length && !eventId) setEventId(evts[0].id);
  }, []);

  const selected = useMemo(
    () => events.find((e) => e.id === eventId) || null,
    [events, eventId]
  );

  // recompute every time the selected event or volunteers change
  const { bestMatches, others, assigned } = useMemo(() => {
    if (!selected) {
      return { bestMatches: [], others: [], assigned: [] };
    }

    const req = new Set(selected.requiredSkills || []);
    const day = selected.date;
    const tod = selected.timeOfDay || "";

    const scored = volunteers.map((v) => {
      const skills = new Set(v.skills || []);
      const overlap = [...req].filter((s) => skills.has(s)).length;
      const overlapPct =
        req.size === 0 ? 1 : overlap / Math.max(1, req.size);

      const available = (v.availability || []).includes(day);
      const pref = v.preferredTimes || null; // null => any time ok
      const timeOk = !tod || !pref || pref.includes(tod);

      // single sortable score: prioritize availability/time, then skills
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
        already: isAssigned(v.id, selected.id),
      };
    });

    // assigned list (always show)
    const assignedVols = getAssignedVolunteers(selected.id);

    // “best” list = available + timeOk (unless admin opts in to show all)
    const filtered = scored.filter((s) =>
      includeUnavailable ? true : s.available && s.timeOk
    );

    filtered.sort((a, b) => b.score - a.score);

    // others (not available/time) only if admin wants to see everything
    const otherPool = includeUnavailable
      ? scored.filter((s) => !(s.available && s.timeOk))
      : [];

    otherPool.sort((a, b) => b.score - a.score);

    return {
      bestMatches: filtered,
      others: otherPool,
      assigned: assignedVols,
    };
  }, [selected, volunteers, includeUnavailable]);

  const doAssign = (volId) => {
    if (!selected) return;
    assignVolunteer(volId, selected.id);
    // refresh “assigned” count without reloading whole page
    setVolunteers([...volunteers]);
  };

  const doUnassign = (volId) => {
    if (!selected) return;
    unassignVolunteer(volId, selected.id);
    setVolunteers([...volunteers]);
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
            Showing{" "}
            <strong>
              {bestMatches.length}
            </strong>{" "}
            match{bestMatches.length === 1 ? "" : "es"} •{" "}
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
              Assigned: <strong>{countAssigned(selected.id)}</strong>
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
                bestMatches.map(({ vol, available, timeOk, overlap, overlapPct, already }) => (
                  <tr key={vol.id}>
                    <td>
                      <strong>{vol.name}</strong>
                      <div className="muted">Skills: {vol.skills?.join(", ") || "—"}</div>
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
                        (vol.preferredTimes?.length
                          ? vol.preferredTimes.join(", ")
                          : "Any time") +
                        (timeOk ? "" : " (prefers different time)")
                      ) : (
                        vol.preferredTimes?.length ? vol.preferredTimes.join(", ") : "Any time"
                      )}
                    </td>
                    <td>
                      <div className="pill-grid readonly">
                        {selected?.requiredSkills?.length ? (
                          selected.requiredSkills.map((s) => (
                            <span
                              key={s}
                              className={`pill ${
                                vol.skills?.includes(s) ? "pill-on" : ""
                              }`}
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="muted">No required skills</span>
                        )}
                      </div>
                      {selected?.requiredSkills?.length ? (
                        <div className="muted" style={{ marginTop: 6 }}>
                          Match: {(overlapPct * 100).toFixed(0)}%
                        </div>
                      ) : null}
                    </td>
                    <td className="actions nowrap">
                      {already ? (
                        <button
                          className="btn btn-danger"
                          onClick={() => doUnassign(vol.id)}
                        >
                          Unassign
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => doAssign(vol.id)}
                          disabled={!selected}
                        >
                          Assign
                        </button>
                      )}
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
                  {others.map(({ vol, available, timeOk, overlapPct, already }) => (
                    <tr key={vol.id}>
                      <td>
                        <strong>{vol.name}</strong>
                        <div className="muted">Skills: {vol.skills?.join(", ") || "—"}</div>
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
                          (vol.preferredTimes?.length
                            ? vol.preferredTimes.join(", ")
                            : "Any time") +
                          (timeOk ? "" : " (prefers different time)")
                        ) : (
                          vol.preferredTimes?.length ? vol.preferredTimes.join(", ") : "Any time"
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
                        {already ? (
                          <button
                            className="btn btn-danger"
                            onClick={() => doUnassign(vol.id)}
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            onClick={() => doAssign(vol.id)}
                            disabled={!selected}
                          >
                            Assign anyway
                          </button>
                        )}
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
              <span className="muted">({countAssigned(selected.id)})</span>
            </div>
            {assigned.length === 0 ? (
              <div className="muted">No volunteers assigned.</div>
            ) : (
              <ul className="vol-list">
                {assigned.map((v) => (
                  <li key={v.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <strong>{v.name}</strong>
                    <span className="muted">— {v.skills.join(", ")}</span>
                    <button
                      className="btn btn-ghost"
                      onClick={() => doUnassign(v.id)}
                      style={{ marginLeft: 8 }}
                    >
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