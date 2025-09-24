import React from "react";
const HistoryPage = () => {
    return (
        <div>
            <h1>Your Volunteer History</h1>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Hours</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Sept 10, 2025</td>
                        <td>Dog Park Cleanup</td>
                        <td>2</td>
                    </tr>
                    <tr>
                        <td>Aug 21, 2025</td>
                        <td>Dog Grooming</td>
                        <td>3</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
export default HistoryPage;