import { handleHealth } from "../src/health-handler.js";

export default function handler(req, res) {
  return handleHealth(req, res);
}
