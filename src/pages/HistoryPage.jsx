import React, { useEffect, useState } from "react";
import { getVolunteerEvents } from "../firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await getVolunteerEvents(user.email); 
          console.log("Fetched volunteer events:", data);
          setHistory(data);
        } catch (err) {
          console.error("Error fetching volunteer events:", err);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user signed in");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="vol-history-root">
      <h1 className="vol-history-title">Your Volunteer History</h1>
      <table className="vol-history-table">
        <thead>
          <tr>
            <th className="vol-history-th">Event</th>
            <th className="vol-history-th">Date</th>
            <th className="vol-history-th">Time</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((entry, idx) => (
              <tr key={entry.id} className={`vol-history-row ${idx % 2 === 0 ? "even" : "odd"}`}>
                <td className="vol-history-td">{entry.name}</td>
                <td className="vol-history-td">{entry.date}</td>
                <td className="vol-history-td">{entry.timeOfDay}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", color: "#888", padding: "1.5rem" }}>
                No history found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
