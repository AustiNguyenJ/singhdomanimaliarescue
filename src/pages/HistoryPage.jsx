import React, { useEffect, useState } from "react";
const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(
            "http://127.0.0.1:5001/singhdomanimaliarescue/us-central1/getVolunteerHistory"
        )
            .then((res) => res.json())
            .then ((data) => {
                setHistory(data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching history:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p style={{ textAlign: "center" }}>Loading...</p>;
    }
    return (
        <div className="history-root"> 
            <h1 className="history-title">Your Volunteer History</h1>
                <table className="history-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map((entry) => (
                            <tr key={entry.id}>
                                <td>{entry.date}</td>
                                <td>{entry.event}</td>
                                <td>{entry.hours}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center", color: "#999" }}>
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