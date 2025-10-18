import React from "react";
import "../styles/skillsList.css";


function SkillsList({ skills }) {
  const [expanded, setExpanded] = React.useState(false);
  const MAX_VISIBLE = 5;

  if (!skills || skills.length === 0) return <span>None</span>;

  const visible = expanded ? skills : skills.slice(0, MAX_VISIBLE);
  const remaining = skills.length - MAX_VISIBLE;

  return (
    <div className="skills-list">
      {visible.map((s, i) => (
        <span key={i} className="skill-tag">{s}</span>
      ))}

      {skills.length > MAX_VISIBLE && (
        <button
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : `+${remaining} more`}
        </button>
      )}
    </div>
  );
}


export default SkillsList;