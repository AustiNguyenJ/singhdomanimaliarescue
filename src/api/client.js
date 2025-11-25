const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function currentHeaders() {
    try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        return user
            ? { "x-uid": user.uid, "x-role": user.role, "x-skills": (user.skills || []).join(",") }
            : {};
    } catch {
        return {};
    }
}

export async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers: currentHeaders() });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
}


// GET /notifications
export async function listNotifications() {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`GET /notifications ${res.status} ${msg}`);
  }
  return res.json();
}

// POST /notifications
export async function createNotification(payload) {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`POST /notifications ${res.status} ${msg}`);
  }
  return res.json();
}
