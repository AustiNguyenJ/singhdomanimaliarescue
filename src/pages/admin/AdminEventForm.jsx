import React from "react";
import EventForm from "../../components/EventForm";

export default function AdminEventForm() {
  return (
    <main className="about-root">
      <section className="about-section">
        <h1 className="about-title">Event Management</h1>
        <EventForm />
      </section>
    </main>
  );
}
