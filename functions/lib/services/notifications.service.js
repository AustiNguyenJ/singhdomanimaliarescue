"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
// functions/src/services/notifications.service.ts
const node_crypto_1 = require("node:crypto");
const notifications_repo_1 = require("../repos/notifications.repo");
const notification_1 = require("../models/notification");
function canSee(n, v) {
    const roles = n.audience?.roles ?? [];
    const uids = n.audience?.uids ?? [];
    const skills = n.audience?.skills ?? [];
    // Public if no audience filters
    if (!roles.length && !uids.length && !skills.length)
        return true;
    if (roles.includes(v.role))
        return true;
    if (uids.includes(v.uid))
        return true;
    if (skills.length && (v.skills ?? []).some(s => skills.includes(s)))
        return true;
    return false;
}
exports.NotificationsService = {
    async listForViewer(viewer) {
        const all = await notifications_repo_1.NotificationsRepo.listAll();
        return all
            .filter(n => canSee(n, viewer))
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },
    async create(payload) {
        const parsed = notification_1.NotificationCreateSchema.parse(payload);
        const newItem = notification_1.NotificationSchema.parse({
            id: (0, node_crypto_1.randomUUID)(),
            createdAt: new Date().toISOString(),
            readBy: [],
            ...parsed
        });
        return notifications_repo_1.NotificationsRepo.create(newItem);
    },
    async markRead(id, uid) {
        const updated = await notifications_repo_1.NotificationsRepo.markRead(id, uid);
        if (!updated)
            throw new Error("NOTIFICATION_NOT_FOUND");
        return updated;
    }
};
