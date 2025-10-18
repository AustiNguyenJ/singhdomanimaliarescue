import { Router } from "express";
import { NotificationsService } from "../services/notifications.service";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateNotificationBody } from "../middleware/validate";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const viewer = { uid: (req as any).user.uid, role: (req as any).user.role, skills: (req as any).user.skills };
  const data = await NotificationsService.listForViewer(viewer);
  res.json(data);
});

router.post("/", requireAuth, requireRole("admin"), validateNotificationBody, async (req, res, next) => {
  try {
    const created = await NotificationsService.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.patch("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const updated = await NotificationsService.markRead(req.params.id, (req as any).user.uid);
    res.json(updated);
  } catch (e) {
    if ((e as Error).message === "NOTIFICATION_NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
    next(e);
  }
});

export default router;
