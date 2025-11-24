import React from "react";
import jsPDF from "jspdf";

export default function ReportsCard() {
  const generatePDF = () => {
    const pdf = new jsPDF();
    pdf.text("Hello", 10, 10);
    pdf.save("test.pdf");
  };

  return (
    <div>
      <button onClick={generatePDF} className="btn btn-primary">
        Generate Test PDF
      </button>
    </div>
  );
}