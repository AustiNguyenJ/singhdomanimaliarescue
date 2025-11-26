import React, { useEffect, useState } from "react";
import { getVolunteerEvents } from "../firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const HistoryPage = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user signed in");
        setLoading(false);
        return;
      }

      try {
        const data = await getVolunteerEvents(user.email);
        console.log("Fetched volunteer events:", data);

        const now = new Date();

        const upcomingEvents = [];
        const pastEvents = [];

        data.forEach((event) => {
          const eventDate = new Date(event.date);
          if (eventDate >= now) upcomingEvents.push(event);
          else pastEvents.push(event);
        });

        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

        setUpcoming(upcomingEvents);
        setPast(pastEvents);
      } catch (err) {
        console.error("Error fetching volunteer events:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  // Reusable section renderer
  const renderTable = (title, list) => (
    <div className="vol-section">
      <h2 className="vol-history-subtitle">{title}</h2>

      <table className="vol-history-table">
        <thead>
          <tr>
            <th className="vol-history-th">Event</th>
            <th className="vol-history-th">Date</th>
            <th className="vol-history-th">Time</th>
          </tr>
        </thead>

        <tbody>
          {list.length > 0 ? (
            list.map((entry, idx) => (
              <tr
                key={entry.id}
                className={`vol-history-row ${idx % 2 === 0 ? "even" : "odd"}`}
              >
                <td className="vol-history-td">{entry.name}</td>
                <td className="vol-history-td">{entry.date}</td>
                <td className="vol-history-td">{entry.timeOfDay}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="3"
                style={{ textAlign: "center", color: "#888", padding: "1.5rem" }}
              >
                None.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="vol-history-root">
      <h1 className="vol-history-title">Your Volunteer History</h1>

      {renderTable("Upcoming Events", upcoming)}
      {renderTable("Past Events", past)}
    </div>
  );
};

export default HistoryPage;
