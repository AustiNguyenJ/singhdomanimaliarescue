"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_service_1 = require("../services/notifications.service");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, async (req, res) => {
    const viewer = { uid: req.user.uid, role: req.user.role, skills: req.user.skills };
    const data = await notifications_service_1.NotificationsService.listForViewer(viewer);
    res.json(data);
});
router.post("/", auth_1.requireAuth, (0, auth_1.requireRole)("admin"), validate_1.validateNotificationBody, async (req, res, next) => {
    try {
        const created = await notifications_service_1.NotificationsService.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        next(e);
    }
});
router.patch("/:id/read", auth_1.requireAuth, async (req, res, next) => {
    try {
        const updated = await notifications_service_1.NotificationsService.markRead(req.params.id, req.user.uid);
        res.json(updated);
    }
    catch (e) {
        if (e.message === "NOTIFICATION_NOT_FOUND")
            return res.status(404).json({ error: "NOT_FOUND" });
        next(e);
    }
});
exports.default = router;
