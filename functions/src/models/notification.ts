import { z } from "zod";

export const NotificationAudienceSchema = z.object({
  roles: z.array(z.enum(["admin","volunteer"])).optional().default([]),
  uids: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
});

export const NotificationCreateSchema = z.object({
  subject: z.string().min(1).max(140),
  body: z.string().min(1).max(5000),
  to: z.string().optional(),
  audience: NotificationAudienceSchema.optional(),
  meta: z.record(z.any()).optional()
});

export const NotificationSchema = NotificationCreateSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  readBy: z.array(z.string()).default([])
});

export type Notification = z.infer<typeof NotificationSchema>;
