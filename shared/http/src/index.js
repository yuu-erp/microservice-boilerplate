"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
exports.http = axios_1.default.create({ timeout: 5000 });
(0, axios_retry_1.default)(exports.http, { retries: 3, retryDelay: axios_retry_1.default.exponentialDelay });
