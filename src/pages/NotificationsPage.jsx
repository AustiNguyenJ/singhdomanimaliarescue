import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/NotificationsPage.css";
import { listNotifications, createNotification } from "../firebase/firestore.js";

const NotificationsPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const location = useLocation();

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = user?.isAdmin || false;

  const backHref = location.pathname.startsWith("/admin") || isAdmin
    ? "/admin"
    : "/dashboard";

  /* ----------------- Load notifications ----------------- */
  useEffect(() => {
    if (!user) {
      setErr("No logged-in user found.");
      setLoading(false);
      return;
    }

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
  }, []);

  /* ----------------- Send notification ----------------- */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!user) return;

    const subject = e.target.subject.value;
    const body = e.target.body.value;

    try {
      await createNotification({
        subject,
        body,
        userEmail: user.email,
        audience: { roles: ["volunteer"] },
        deleted: false,
      });

      e.target.reset();
      alert("Notification sent!");

      // Refresh list
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
