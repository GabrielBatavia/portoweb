import "./styles.css";
import { CharacterController } from "./character/character-controller.js";
import { NeuralField } from "./neural/neural-field.js";
import { ChatClient } from "./chat/chat-client.js";
import { ConversationController } from "./chat/conversation-controller.js";
import { MemoryPanel } from "./memory/memory-panel.js";

const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = configuredApiUrl || (isLocal ? "http://localhost:3001" : "");

const shell = document.querySelector(".app-shell");
const character = new CharacterController({
  shell,
  wrap: document.getElementById("character-wrap"),
  statusLabel: document.getElementById("character-status-label"),
});

const neural = new NeuralField(document.getElementById("neural-field"));
neural.init();
character.init();

const chat = new ConversationController({
  client: new ChatClient(apiBaseUrl),
  character,
  neural,
  form: document.getElementById("chat-form"),
  input: document.getElementById("chat-input"),
  transcript: document.getElementById("transcript"),
  promptList: document.getElementById("prompt-list"),
  sendButton: document.getElementById("send-button"),
  cancelButton: document.getElementById("cancel-button"),
});
chat.init();

const memoryPanel = new MemoryPanel({
  panel: document.getElementById("memory-panel"),
  backdrop: document.getElementById("memory-backdrop"),
  title: document.getElementById("memory-title"),
  number: document.getElementById("memory-number"),
  content: document.getElementById("memory-content"),
  closeButton: document.getElementById("memory-close"),
});
memoryPanel.init();

const initialMemory = new URLSearchParams(window.location.search).get("memory");
if (["profile", "experience", "work", "recognition"].includes(initialMemory)) {
  window.setTimeout(() => memoryPanel.open(initialMemory), 480);
}

window.addEventListener("pagehide", () => {
  character.destroy();
  neural.destroy();
});
