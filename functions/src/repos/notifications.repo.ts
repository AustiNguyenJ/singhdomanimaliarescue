
import { Notification } from "../models/notification";


// In-memory store for demo purposes only
// Will be replacing with database calls next assignment 
let store: Notification[] = [
  {
    id: "1",
    subject: "Saturday Clean-Up",
    body: "Arrive 9AM. Bring gloves.",
    to: "All Volunteers",
    createdAt: new Date().toISOString(),
    readBy: [],
    audience: { roles: ["volunteer"], uids: [], skills: [] },          // ← add uids, skills
  },
  {
    id: "2",
    subject: "Leashes Needed",
    body: "We are short on medium leashes.",
    to: "Dog Walkers",
    createdAt: new Date().toISOString(),
    readBy: [],
    audience: { roles: ["volunteer"], uids: [], skills: ["Dog walking"] }, // ← add uids
  },
];

export const NotificationsRepo = {
  async listAll() { return [...store]; },
  async create(n: Notification) { store.unshift(n); return n; },
  async markRead(id: string, uid: string) {
    const item = store.find(n => n.id === id);
    if (!item) return null;
    if (!item.readBy.includes(uid)) item.readBy.push(uid);
    return item;
  },
  __reset(data?: Notification[]) { store = data ?? []; },
};
