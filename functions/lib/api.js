"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const notifications_service_1 = require("./services/notifications.service");
const auth_1 = require("./middleware/auth");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({ origin: true }));
exports.app.use(express_1.default.json());
// Health check
exports.app.get("/health", (_req, res) => res.json({ ok: true }));
// GET /notifications → visible to the current viewer
exports.app.get("/notifications", auth_1.requireAuth, async (req, res, next) => {
    try {
        const user = req.user;
        const data = await notifications_service_1.NotificationsService.listForViewer({
            uid: user.uid,
            role: user.role,
            skills: user.skills ?? [],
        });
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
// PATCH /notifications/:id/read
exports.app.patch("/notifications/:id/read", auth_1.requireAuth, async (req, res, next) => {
    try {
        const user = req.user;
        const updated = await notifications_service_1.NotificationsService.markRead(req.params.id, user.uid);
        res.json(updated);
    }
    catch (e) {
        if (e.message === "NOTIFICATION_NOT_FOUND") {
            return res.status(404).json({ error: "NOT_FOUND" });
        }
        next(e);
    }
});
// POST /notifications (admin only)
exports.app.post("/notifications", auth_1.requireAuth, async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role !== "admin")
            return res.status(403).json({ error: "FORBIDDEN" });
        const created = await notifications_service_1.NotificationsService.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        next(e);
    }
});
