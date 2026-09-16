import { appLinks } from "./appLinks";

const apiBase = appLinks.navigator.apiUrl.replace(/\/$/, "");
const endpoint = (pathname) => `${apiBase}/api${pathname}`;

async function readBrain(pathname) {
  const response = await fetch(endpoint(pathname), {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Bee Brain needs its protected sign-in before Beeps can read it.");
  }
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Bee Brain Navigator is unavailable.");
  return payload;
}

export function getBeeBrainStatus() {
  return readBrain("/status");
}

export function getBeepsDailyBrief({ date, timezone } = {}) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (timezone) params.set("timezone", timezone);
  const query = params.toString();
  return readBrain(`/daily-brief${query ? `?${query}` : ""}`);
}

export function getBeepsWorkIntake({ since = "14d", maxResults = 25 } = {}) {
  const params = new URLSearchParams({ since, maxResults: String(maxResults) });
  return readBrain(`/work-intake?${params.toString()}`);
}

export async function askBeeBrain(
  question,
  mode = "model",
  conversation = [],
  sourceMode = "auto",
  groundingScope = "auto",
  attachmentContext = "",
  conversationId = null,
) {
  const body = { question, mode, conversation, attachmentContext };
  if (sourceMode && sourceMode !== "auto") body.sourceMode = sourceMode;
  if (groundingScope && groundingScope !== "auto") body.groundingScope = groundingScope;
  if (conversationId) body.conversationId = conversationId;

  const response = await fetch(endpoint("/ask"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Bee Brain needs its protected sign-in before Beeps can read it.");
  }

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Bee Brain Navigator is unavailable.");
  return payload;
}

export async function extractBeepsAttachments(files) {
  const response = await fetch(endpoint("/remote/document/extract"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ files }),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Bee Brain needs its protected sign-in before Beeps can read an attachment.");
  }

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Beeps could not read that attachment.");
  return payload;
}

export async function recordBeepsContext(event) {
  const response = await fetch(endpoint("/context/log"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(event),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Beeps could not record this context.");
  return payload;
}

/**
 * Opens a Server-Sent Events connection to /api/local/conversations/stream
 * for the given conversationId and calls onEvent for each progress event.
 * Returns a close() function — call it when the final /api/ask response arrives.
 *
 * Event shapes: { type: "queued"|"routed"|"generating"|"finalizing"|"done", label: string }
 */
export function openBeepsStream(conversationId, onEvent) {
  if (!conversationId || typeof onEvent !== "function") return () => {};
  const url = `${endpoint("/local/conversations/stream")}?conversationId=${encodeURIComponent(conversationId)}`;
  let es;
  try {
    es = new EventSource(url, { withCredentials: true });
  } catch {
    return () => {};
  }
  const handleEvent = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onEvent(data);
    } catch {
      // Ignore malformed events
    }
  };
  es.onmessage = handleEvent;
  const eventTypes = [
    "connected",
    "queued",
    "routed",
    "generating",
    "chunk",
    "tool",
    "finalizing",
    "working",
    "done",
  ];
  for (const type of eventTypes) {
    es.addEventListener(type, handleEvent);
  }
  es.onerror = () => {
    // Connection closed or error — clean up silently
    es.close();
  };
  return () => es.close();
}
