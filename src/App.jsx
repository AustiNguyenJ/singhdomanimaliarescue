import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMatchingForm from "./pages/admin/AdminMatchingForm";
import ManageEvents from "./pages/admin/ManageEvents";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import HistoryPage from "./pages/HistoryPage";
import NotificationsPage from "./pages/NotificationsPage";

import { app } from "./firebase/config";
import { AuthProvider } from "./context/AuthContext"; 
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    console.log("✅ Firebase connected:", app.options.projectId);
  }, []);


  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage/>
            </ProtectedRoute>
           } />
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
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
