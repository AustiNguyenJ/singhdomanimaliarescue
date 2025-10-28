import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/NotificationsPage.css";
import { listNotifications, createNotification, getEvents } from "../firebase/firestore.js";
import { useAuth } from "../context/AuthContext";

const NotificationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");

  // Wait until Firebase auth finishes
  if (authLoading) return <p>Loading…</p>;
  if (!user) return <p>No logged-in user found.</p>;

  const isAdmin = user.isAdmin || false;
  const backHref = location.pathname.startsWith("/admin") || isAdmin
    ? "/admin"
    : "/dashboard";


    useEffect(() => {
      const loadEvents = async () => {
        try {
          const evts = await getEvents();
          const filtered = (evts || []).filter(evt => !evt.deleted);
          setEvents(filtered);
          if (filtered.length && !eventId) setEventId(filtered[0].id);
        }
        catch (e) {
          console.error("Failed to load events:", e);
        }
      };
      loadEvents();  
    }, []);
  /* ----------------- Load notifications ----------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await listNotifications(user.email, user.role);
        if (!alive) return;
        setMessages(data);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load notifications");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [user.email, user.role]);

  /* ----------------- Send notification ----------------- */
  const handleSend = async (e) => {
    e.preventDefault();

    const evt = e.target.evt.value;
    const subject = e.target.subject.value;
    const body = e.target.body.value;

    try {
      await createNotification({
        eventId: evt,
        subject,
        body,
        userEmail: user.email,
        audience: { roles: ["volunteer"] },
        deleted: false,
      });

      e.target.reset();
      alert("Notification sent!");

      const updated = await listNotifications(user.email, user.role);
      setMessages(updated);
    } catch (err) {
      alert("Failed to send notification: " + err.message);
    }
  };

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <h1>Notifications</h1>
        <Link to={backHref} className="back-link">Back</Link>
      </header>

      {isAdmin && (
        <form onSubmit={handleSend} className="card admin-send-form">
          <h3>Send a New Notification</h3>
          <select
            name="evt"
            className="notification-select"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.date}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            required
            className="notification-input"
          />
          <textarea
            name="body"
            placeholder="Message"
            required
            className="notification-textarea"
          />
          <button type="submit" className="notification-send-btn">
            Send
          </button>
        </form>
      )}

      <section className="card">
        <h2>Recent Notifications</h2>
        {loading && <p>Loading…</p>}
        {err && <p className="notifications-empty">{err}</p>}
        {!loading && !err && messages.length === 0 && <p>No messages yet.</p>}

        {!loading && !err && messages.length > 0 && (
          <ul className="messages-list">
            {messages.map((m) => (
              <li key={m.id}>
                <div className="msg-subject">{m.subject || m.title}</div>
                <div className="msg-meta">
                  {m.userEmail && <>From: {m.userEmail} • </>}
                  {m.audienceRoles?.length && <>To: {m.audienceRoles.join(", ")}</>}
                </div>
                <p>{m.body || m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;
