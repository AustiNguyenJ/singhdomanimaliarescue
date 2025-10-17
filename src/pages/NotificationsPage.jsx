
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/NotificationsPage.css";
import { apiGet, createNotification } from "../api/client.js";


const demoMessages =[
    { id: 1, from: "Admin", to: "All Volunteers", subject: "Saturday Clean-Up", body: "Arrive 9AM. Bring gloves." },
    { id: 2, from: "Event Lead", to: "Dog Walkers", subject: "5 puppies need walks", body: "We are short dog walkers." },
];


const NotificationsPage = () => {
  // const [messages, setMessages] = useState([]); //this is to run backend call
  // const [loading, setLoading] = useState(true);
  // const [err, setErr] = useState(null);
  // const location = useLocation();
   const [messages, setMessages] = useState(demoMessages); //this is to run backend call
   const [loading, setLoading] = useState(false);
   const [err, setErr] = useState(null);
   const location = useLocation();
 
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  const backHref = location.pathname.startsWith("/admin")
    ? "/admin"
    : user?.role === "admin"
    ? "/admin"
    : "/dashboard";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet("/notifications"); // backend call
        if (!alive) return;
        //setMessages(data);
        //conditiopnal to keep demo if backend is empty
        if (Array.isArray(data) && data.length) {
          setMessages(data);                           // replace demo with real data
        } else {
          // keep demo if backend is empty
        }
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load notifications");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <h1>Notifications</h1>
        <Link to={backHref} className="back-link">Back to Dashboard</Link>
      </header>

      {user?.role === "admin" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const subject = e.target.subject.value;
            const body = e.target.body.value;
            try {
              await createNotification({
                subject,
                body,
                audience: { roles: ["volunteer"] }, // target group
              });
              e.target.reset();
              alert("Notification sent!");
              // Refresh list after sending
              const updated = await apiGet("/notifications");
              setMessages(updated);
            } catch (err) {
              alert("Failed to send notification: " + err.message);
            }
          }}
          className="card admin-send-form"
        >
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

        {!loading && !err && messages.length === 0 && (
          <p>No messages yet.</p>
        )}

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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;


