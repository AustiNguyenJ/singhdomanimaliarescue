import { onRequest } from "firebase-functions/v2/https";
import { app } from "./api";
export const api = onRequest(app);
