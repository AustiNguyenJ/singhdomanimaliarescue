"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const admin = require("firebase-admin");
const https_1 = require("firebase-functions/v2/https");
const api_1 = require("./api");

try {
  admin.app();
} catch {
  admin.initializeApp();
}

const { app } = require("./api");

exports.api = (0, https_1.onRequest)(api_1.app);
