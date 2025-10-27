import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/VolunDashboard.css"

export default function VolunteerDashboard() {

    console.log("VolunteerDashboard rendering v3");
    return (
        <div className="volunteer-dashboard">
            <h1>Volunteer Dashboard</h1>
            <p className="subtitle">Welcome back! - Use the options below to manage your volunteering activity.</p>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="icon" style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                    <h2>Volunteer History</h2>
                    <p>View all your past volunteering activities and logged hours.</p>
                    <Link to="/history" className="dashboard-btn">
                        View History
                    </Link>
                </div>

                <div className="dashboard-card">
                    <div className="icon" style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
                    <h2>Edit Profile</h2>
                    <p>Update your personal info and availability settings.</p>
                    <Link to="/profile" className="dashboard-btn">
                        Edit Profile
                    </Link>
                </div>

                <div className="dashboard-card">
                    <div className="icon" style={{ fontSize: 32, marginBottom: 12 }}>🔔</div>
                    <h2>Notifications</h2>
                    <p>Check for new assignments, messages, or updates.</p>
                    <Link to="/notifications" className="dashboard-btn">
                        View Notifications
                    </Link>
                </div>  
            </div>
        </div>
    );
}

