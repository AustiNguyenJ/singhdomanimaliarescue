// functions/src/services/notifications.service.ts
import { randomUUID } from "node:crypto";
import { NotificationsRepo } from "../repos/notifications.repo";
import {
  NotificationCreateSchema,
  NotificationSchema,
  type Notification
} from "../models/notification";

type Viewer = { uid: string; role: "admin" | "volunteer"; skills?: string[] };

function canSee(n: Notification, v: Viewer) {
  const roles  = n.audience?.roles  ?? [];
  const uids   = n.audience?.uids   ?? [];
  const skills = n.audience?.skills ?? [];

  // Public if no audience filters
  if (!roles.length && !uids.length && !skills.length) return true;
  if (roles.includes(v.role)) return true;
  if (uids.includes(v.uid)) return true;
  if (skills.length && (v.skills ?? []).some(s => skills.includes(s))) return true;
  return false;
}

export const NotificationsService = {
  async listForViewer(viewer: Viewer) {
    const all = await NotificationsRepo.listAll();
    return all
      .filter(n => canSee(n, viewer))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async create(payload: unknown) {
    const parsed = NotificationCreateSchema.parse(payload);
    const newItem = NotificationSchema.parse({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      readBy: [],
      ...parsed
    });
    return NotificationsRepo.create(newItem);
  },

  async markRead(id: string, uid: string) {
    const updated = await NotificationsRepo.markRead(id, uid);
    if (!updated) throw new Error("NOTIFICATION_NOT_FOUND");
    return updated;
  }
};
