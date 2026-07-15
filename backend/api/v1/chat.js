import { handleChat } from "../../src/chat-handler.js";

export default async function handler(req, res) {
  return handleChat(req, res);
}
