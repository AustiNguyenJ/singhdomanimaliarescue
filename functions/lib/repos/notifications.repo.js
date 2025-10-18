"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRepo = void 0;
// In-memory store for demo purposes only
// Will be replacing with database calls next assignment 
let store = [
    {
        id: "1",
        subject: "Saturday Clean-Up",
        body: "Arrive 9AM. Bring gloves.",
        to: "All Volunteers",
        createdAt: new Date().toISOString(),
        readBy: [],
        audience: { roles: ["volunteer"], uids: [], skills: [] }, // ← add uids, skills
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
exports.NotificationsRepo = {
    async listAll() { return [...store]; },
    async create(n) { store.unshift(n); return n; },
    async markRead(id, uid) {
        const item = store.find(n => n.id === id);
        if (!item)
            return null;
        if (!item.readBy.includes(uid))
            item.readBy.push(uid);
        return item;
    },
    __reset(data) { store = data ?? []; },
};
