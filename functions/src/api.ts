import express from "express";
import cors from "cors";
import { NotificationsService } from "./services/notifications.service";
import { requireAuth } from "./middleware/auth";

export const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// GET /notifications → visible to the current viewer
app.get("/notifications", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).user as {
      uid: string; role: "admin" | "volunteer"; skills?: string[];
    };
    const data = await NotificationsService.listForViewer({
      uid: user.uid,
      role: user.role,
      skills: user.skills ?? [],
    });
    res.json(data);
  } catch (e) { next(e); }
});

// PATCH /notifications/:id/read
app.patch("/notifications/:id/read", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).user as { uid: string };
    const updated = await NotificationsService.markRead(req.params.id, user.uid);
    res.json(updated);
  } catch (e) {
    if ((e as Error).message === "NOTIFICATION_NOT_FOUND") {
      return res.status(404).json({ error: "NOT_FOUND" });
    }
    next(e);
  }
});

// POST /notifications (admin only)
app.post("/notifications", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).user as { role: "admin" | "volunteer" };
    if (user.role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });
    const created = await NotificationsService.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});
