import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import HistoryPage from "./pages/HistoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import GetInvolvedPage from "./pages/GetInvolvedPage";
import EventForm from "./components/EventForm";
//import AdminEventForm from "./pages/admin/AdminEventForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMatchingForm from "./pages/admin/AdminMatchingForm";
import ManageEvents from "./pages/admin/ManageEvents";
import app from "./firebase/firebase"
import { getApp } from "firebase/app";
import { useLocation } from "react-router-dom";

function NotFound() {
  const loc = useLocation();
  return (
    <div style={{ padding: 24 }}>
      No route for: <code>{loc.pathname}</code>
    </div>
  );
}

function App() {
  useEffect(() => {
    const firebaseApp = getApp();
    console.log("✅ Firebase connected:", firebaseApp.options.projectId);
  }, []);

  return (
    <Router>
      <Header />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<VolunteerDashboard />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/get-involved" element={<GetInvolvedPage />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/events" element={<EventForm />} />
          <Route path="/admin/matching" element={<AdminMatchingForm />} />
          <Route path="/admin/events/manage" element={<ManageEvents />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;