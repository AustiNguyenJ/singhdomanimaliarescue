"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
function requireAuth(req, res, next) {
    const uid = req.header("x-uid");
    const role = req.header("x-role");
    const skills = (req.header("x-skills") || "")
        .split(",").map(s => s.trim()).filter(Boolean);
    if (!uid || !role)
        return res.status(401).json({ error: "UNAUTHENTICATED" });
    req.user = { uid, role, skills };
    next();
}
function requireRole(role) {
    return (req, res, next) => {
        if (req.user?.role !== role)
            return res.status(403).json({ error: "FORBIDDEN" });
        next();
    };
}
