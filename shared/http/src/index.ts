import axios from "axios";
import axiosRetry from "axios-retry";
export const http = axios.create({ timeout: 5000 });
axiosRetry(http, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
