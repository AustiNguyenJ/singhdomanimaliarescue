import express from "express";
import cors from "cors";
import notifications from "./notifications.routes";

export const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/notifications", notifications);
