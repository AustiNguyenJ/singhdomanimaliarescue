"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationBody = validateNotificationBody;
const notification_1 = require("../models/notification");
function validateNotificationBody(req, res, next) {
    try {
        notification_1.NotificationCreateSchema.parse(req.body);
        next();
    }
    catch (e) {
        return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors ?? String(e) });
    }
}
