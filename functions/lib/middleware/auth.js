"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;

const admin = require("firebase-admin");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "UNAUTHENTICATED" });
    }

    const idToken = authHeader.substring(7);
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Load role/skills from Firestore to attach into req.user
    const snap = await admin.firestore().doc(`users/${uid}`).get();
    const data = snap.exists ? snap.data() : {};
    const role = data?.isAdmin ? "admin" : "volunteer";
    const skills = Array.isArray(data?.skills) ? data.skills : [];

    req.user = { uid, role, skills };
    next();
  } catch (e) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.user?.role !== role)
            return res.status(403).json({ error: "FORBIDDEN" });
        next();
    };
}

module.exports = { requireAuth, requireRole };