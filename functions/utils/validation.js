function validateHistoryEntry(entry) {
    if (!entry.date || !entry.event || !entry.hours) return "All fields are required.";
    if (typeof entry.hours !== "number" || entry.hours <= 0) return "Hours must be a positive number.";
    if (entry.event.length > 100) return "Event name is too long.";
    return null;
  }
  
  function validateVolunteerProfile(profile) {
    if (!profile.name) return "Name is required.";
    if (!Array.isArray(profile.skills) || profile.skills.length === 0)
      return "At least one skill is required.";
    if (!profile.location) return "Location is required.";
    return null;
  }
  
  module.exports = { validateHistoryEntry, validateVolunteerProfile };
  