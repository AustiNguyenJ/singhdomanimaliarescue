import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const uid = req.header("x-uid");
  const role = req.header("x-role") as "admin" | "volunteer" | undefined;
  const skills = (req.header("x-skills") || "")
    .split(",").map(s => s.trim()).filter(Boolean);

  if (!uid || !role) return res.status(401).json({ error: "UNAUTHENTICATED" });
  (req as any).user = { uid, role, skills };
  next();
}

export function requireRole(role: "admin" | "volunteer") {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role !== role) return res.status(403).json({ error: "FORBIDDEN" });
    next();
  };
}
