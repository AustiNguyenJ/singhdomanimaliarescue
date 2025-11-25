import React, { useState } from "react";
import jsPDF from "jspdf";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export default function ReportsCard() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(null); // "events" | "volunteers"
  const [loading, setLoading] = useState(false);

  const openModal = (reportType) => {
    setType(reportType);
    setOpen(true);
  };

  // Firestore fetchers (inline)

  async function fetchEvents() {
    const snap = await getDocs(collection(db, "events"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async function fetchUsers() {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Helpers

  function nowStamp() {
    return new Date().toLocaleString();
  }

  function safeArray(val) {
    return Array.isArray(val) ? val : [];
  }

  // Turn objects into CSV string
  function toCSV(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const escape = (v) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ];
    return lines.join("\n");
  }

  function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // page-break guard
  function ensureSpace(doc, y, needed = 10) {
    if (y + needed > 280) {
      doc.addPage();
      return 18;
    }
    return y;
  }

  // draw a divider line
  function drawDivider(doc, y) {
    y = ensureSpace(doc, y, 6);
    doc.setDrawColor(104, 156, 95);
    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);
    return y + 6;
  }

  // Build Events Report

  async function buildEventsReport() {
    const events = await fetchEvents();

    events.sort((a, b) =>
      (a.date || "").localeCompare(b.date || "")
    );

    // Rows for CSV
    const rows = events.map((e) => ({
      name: e.name || "",
      date: e.date || "",
      timeOfDay: e.timeOfDay || "",
      location: e.location || "",
      urgency: e.urgency || "",
      description: e.description || "",
      requiredSkills: safeArray(e.requiredSkills).join("; "),
      assignedVolunteers: safeArray(e.assignedVolunteers).join("; "),
      assignedCount: safeArray(e.assignedVolunteers).length,
    }));

    return { events, rows };
  }

  // Build Volunteer Report
  // (history derived from events)

  async function buildVolunteersReport() {
    const [users, events] = await Promise.all([
      fetchUsers(),
      fetchEvents(),
    ]);

    const participationMap = new Map();
    events.forEach((e) => {
      safeArray(e.assignedVolunteers).forEach((email) => {
        if (!participationMap.has(email)) participationMap.set(email, []);
        participationMap
          .get(email)
          .push(e.name || "(unnamed event)");
      });
    });

    const volunteers = users.filter((u) => !u.isAdmin);

    const rows = volunteers.map((v) => {
      const email = v.email || v.id;
      const history = participationMap.get(email) || [];
      return {
        fullName: v.fullName || "",
        email,
        city: v.city || "",
        state: v.state || "",
        skills: safeArray(v.skills).join("; "),
        preferences: v.preferences || "",
        eventsParticipated: history.length,
        participationHistory: history.join("; "),
      };
    });

    rows.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return { volunteers, rows, participationMap };
  }

  // PDF Generators

  function generateEventsPDF(events) {
    const doc = new jsPDF();
    let y = 18;

    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Events Report", 14, y);
    y += 9;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Report created: ${nowStamp()}`, 14, y);
    y += 8;

    doc.setFontSize(12);

    events.forEach((e, i) => {
      y = ensureSpace(doc, y, 12);

      const title = `${i + 1}. ${e.name || "(unnamed event)"}`;

      doc.setFont(undefined, "bold");
      doc.text(title, 14, y);
      y += 6;

      doc.setFont(undefined, "normal");

      const chunks = [
        `Date: ${e.date || "N/A"}  |  Time: ${e.timeOfDay || "N/A"}`,
        `Location: ${e.location || "N/A"}  |  Urgency: ${e.urgency || "N/A"}`,
        `Required Skills: ${
          safeArray(e.requiredSkills).join(", ") || "None"
        }`,
        `Assigned Volunteers (${safeArray(e.assignedVolunteers).length}):`,
        `${safeArray(e.assignedVolunteers).join(", ") || "None"}`,
        `Description: ${e.description || "N/A"}`,
      ];

      chunks.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 180);
        wrapped.forEach((w) => {
          y = ensureSpace(doc, y, 6);
          doc.text(w, 14, y);
          y += 5;
        });
      });

      // divider between events
      if (i < events.length - 1) {
        y += 2;
        y = drawDivider(doc, y);
      } else {
        y += 4;
      }
    });

    doc.save("events_report.pdf");
  }

  function generateVolunteersPDF(volunteers, participationMap) {
    const doc = new jsPDF();
    let y = 18;

    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Volunteer Participation Report", 14, y);
    y += 9;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Report created: ${nowStamp()}`, 14, y);
    y += 8;

    doc.setFontSize(12);

    volunteers.forEach((v, i) => {
      const email = v.email || v.id;
      const history = participationMap.get(email) || [];

      y = ensureSpace(doc, y, 12);

      doc.setFont(undefined, "bold");
      doc.text(`${i + 1}. ${v.fullName || "(no name)"} — ${email}`, 14, y);
      y += 6;

      doc.setFont(undefined, "normal");

      const skillsLine = `Skills: ${safeArray(v.skills).join(", ") || "None"}`;
      doc.splitTextToSize(skillsLine, 180).forEach((w) => {
        y = ensureSpace(doc, y, 6);
        doc.text(w, 14, y);
        y += 5;
      });

      y = ensureSpace(doc, y, 6);
      doc.text(`Events Participated: ${history.length}`, 14, y);
      y += 6;

      y = ensureSpace(doc, y, 6);
      doc.text("Participation History:", 14, y);
      y += 5;

      if (history.length === 0) {
        y = ensureSpace(doc, y, 6);
        doc.text("None", 18, y);
        y += 6;
      } else {
        history.forEach((eventName) => {
          const lines = doc.splitTextToSize(`• ${eventName}`, 175);
          lines.forEach((ln) => {
            y = ensureSpace(doc, y, 6);
            doc.text(ln, 18, y);
            y += 5;
          });
        });
        y += 2;
      }

      // divider between volunteers
      if (i < volunteers.length - 1) {
        y = drawDivider(doc, y);
      } else {
        y += 4;
      }
    });

    doc.save("volunteers_report.pdf");
  }

  // Main generator
 
  const generate = async (format) => {
    setLoading(true);
    try {
      if (type === "events") {
        const { events, rows } = await buildEventsReport();
        if (format === "csv") {
          const csv = toCSV(rows);
          downloadBlob("events_report.csv", csv, "text/csv");
        } else {
          generateEventsPDF(events);
        }
      }

      if (type === "volunteers") {
        const { volunteers, rows, participationMap } =
          await buildVolunteersReport();

        if (format === "csv") {
          const csv = toCSV(rows);
          downloadBlob("volunteers_report.csv", csv, "text/csv");
        } else {
          generateVolunteersPDF(volunteers, participationMap);
        }
      }

      setOpen(false);
      setType(null);
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // UI

  return (
    <>
      {/* card is meant to be placed directly in the grid */}
      <div className="dashboard-card">
        <div className="icon" style={{ fontSize: 32, marginBottom: 12 }}>
          📊
        </div>
        <h2>Reports</h2>
        <p>Download event and volunteer participation reports.</p>

        <div className="btn-row" style={{ gap: 8 }}>
          <button
            onClick={() => openModal("events")}
            className="btn btn-primary"
          >
            Events Report
          </button>
          <button
            onClick={() => openModal("volunteers")}
            className="btn btn-primary"
          >
            Volunteer Report
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-semibold mb-2">
              {type === "events"
                ? "Generate Events Report"
                : "Generate Volunteer Report"}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Choose an export format:
            </p>

            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={() => generate("csv")}
                className="flex-1 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {loading ? "Generating..." : "CSV"}
              </button>
              <button
                disabled={loading}
                onClick={() => generate("pdf")}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                {loading ? "Generating..." : "PDF"}
              </button>
            </div>

            <button
              disabled={loading}
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}