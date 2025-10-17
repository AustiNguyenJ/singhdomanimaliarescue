"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const api_1 = require("./api");
exports.api = (0, https_1.onRequest)(api_1.app);
