// ---- constants used by forms ----
export const SKILLS = [
  "Dog Walking",
  "Cat Care",
  "Small Animal Handling",
  "Animal Grooming",
  "Cleaning & Sanitation",
  "Feeding",
  "Laundry & Bedding Maintenance",
  "Facility Upkeep",
  "Photography & Social Media",
  "Fundraising & Donations Management",
  "Administrative / Clerical Skills",
  "First Aid",
  "Customer Service",
  "Teamwork",
];

export const URGENCY = ["Low", "Medium", "High", "Critical"];

export const TIME_OF_DAY = ["Morning", "Afternoon", "Evening"];

// ---- seed data for local dev ----
export const EVENTS = [
  {
    id: "evt-1",
    name: "Adoption Event - Midtown",
    description: "Help handle animals and meet adopters.",
    location: "123 Midtown Ave",
    requiredSkills: ["Dog Walking"],
    urgency: "Medium",
    date: "2025-10-12",
  },
];

export const VOLUNTEERS = [
  {
    id: "vol-1",
    name: "Alex Kim",
    skills: ["Dog Walking", "Transport"],
    availability: ["2025-10-12", "2025-10-19"],
  },
];
const ADMIN_DATA = { SKILLS, URGENCY, EVENTS, VOLUNTEERS };
export default ADMIN_DATA;