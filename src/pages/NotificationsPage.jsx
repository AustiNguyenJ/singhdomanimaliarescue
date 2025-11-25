import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/NotificationsPage.css";
import { listNotifications, createNotification, getEvents } from "../firebase/firestore.js";
import { useAuth } from "../context/AuthContext";

const NotificationsPage = () => {
  // start with demo so we see layout; demo will be replaced with backend data if present
  const [messages, setMessages] = useState(demoMessages);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sendType, setSendType] = useState("assignment");
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");

  const role = profile?.isAdmin ? "admin" : "volunteer";
  const backHref = location.pathname.startsWith("/admin")
    ? "/admin"
    : role === "admin"
      ? "/admin"
      : "/dashboard";

  const uid = getAuth().currentUser?.uid || null;


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

        // load profile (to know if admin)
        const p = await getUserProfile();
        if (!alive) return;
        setProfile(p || { isAdmin: false });

        // load notifications through the Functions API
        const data = await getNotifications();
        if (!alive) return;

        if (Array.isArray(data) && data.length) {
          setMessages(data); // replace demo with real data
        }
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
        <Link to={backHref} className="back-link">
          Back to Dashboard
        </Link>
      </header>

      {role === "admin" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const subject = e.target.subject.value;
            const body = e.target.body.value;
            try {
              const payload = { subject, body, audience: { roles: ["volunteer"] } };

              if (sendType === "update") {
                await sendNotificationUpdate(payload);
              } else if (sendType === "reminder") {
                await sendNotificationReminder(payload);
              } else {
                await sendNotification(payload);
              }

              e.target.reset();
              alert("Notification sent!");

              // Refresh list after sending
              const updated = await getNotifications();
              setMessages(updated);
            } catch (err) {
              alert("Failed to send notification: " + err.message);
            }
          }}
          className="card admin-send-form"
        >
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
                  {m.title != "New Event Assignment" ? 
                    m.userEmail && <>From: Event Admin </>
                  : null}
                    {/* {m.audienceRoles?.length && <>To: {m.userEmail}</>} */}
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
