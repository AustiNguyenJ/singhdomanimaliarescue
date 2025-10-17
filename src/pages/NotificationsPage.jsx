import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/NotificationsPage.css";
import {
  getNotifications,
  sendNotification,
  sendNotificationUpdate,
  sendNotificationReminder,
  markNotificationRead,
  getUserProfile,
} from "../firebase/firestore.js";
import { getAuth } from "firebase/auth";

const demoMessages = [
  { id: 1, from: "Admin", to: "All Volunteers", subject: "Saturday Clean-Up", body: "Arrive 9AM. Bring gloves.", readBy: [] },
  { id: 2, from: "Event Lead", to: "Dog Walkers", subject: "5 puppies need walks", body: "We are short dog walkers.", readBy: [] },
];

const NotificationsPage = () => {
  // start with demo so we see layout; demo will be replaced with backend data if present
  const [messages, setMessages] = useState(demoMessages);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sendType, setSendType] = useState("assignment"); 
  const location = useLocation();

  const role = profile?.isAdmin ? "admin" : "volunteer";
  const backHref = location.pathname.startsWith("/admin")
    ? "/admin"
    : role === "admin"
    ? "/admin"
    : "/dashboard";

  const uid = getAuth().currentUser?.uid || null;

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
    return () => {
      alive = false;
    };
  }, []);

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

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <label className="text-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Type:
              <select
                value={sendType}
                onChange={(e) => setSendType(e.target.value)}
                className="notification-input"
                style={{ width: 180, margin: 0 }}
              >
                <option value="assignment">Assignment</option>
                <option value="update">Update</option>
                <option value="reminder">Reminder</option>
              </select>
            </label>
          </div>

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
                <div className="msg-subject">{m.subject}</div>
                <div className="msg-meta">
                  {m.from ? <>From: {m.from} • </> : null}
                  {m.to ? <>To: {m.to}</> : null}
                </div>
                <p>{m.body}</p>

                {uid && !(m.readBy || []).includes(uid) && (
                  <button
                    className="notification-send-btn"
                    style={{ marginTop: 8 }}
                    onClick={async () => {
                      try {
                        await markNotificationRead(m.id);
                        // update local state
                        setMessages((prev) =>
                          prev.map((x) =>
                            x.id === m.id ? { ...x, readBy: [...(x.readBy || []), uid] } : x
                          )
                        );
                      } catch (e) {
                        alert("Failed to mark as read: " + (e?.message || e));
                      }
                    }}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;
