"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchema = exports.NotificationCreateSchema = exports.NotificationAudienceSchema = void 0;
const zod_1 = require("zod");
exports.NotificationAudienceSchema = zod_1.z.object({
    roles: zod_1.z.array(zod_1.z.enum(["admin", "volunteer"])).optional().default([]),
    uids: zod_1.z.array(zod_1.z.string()).optional().default([]),
    skills: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
exports.NotificationCreateSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1).max(140),
    body: zod_1.z.string().min(1).max(5000),
    to: zod_1.z.string().optional(),
    audience: exports.NotificationAudienceSchema.optional(),
    meta: zod_1.z.record(zod_1.z.any()).optional()
});
exports.NotificationSchema = exports.NotificationCreateSchema.extend({
    id: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    readBy: zod_1.z.array(zod_1.z.string()).default([])
});
