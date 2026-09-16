import { appLinks } from "./appLinks";

export async function draftBeepsSessionNote(input) {
  const base = appLinks.navigator.apiUrl.replace(/\/$/, "");
  const response = await fetch(`${base}/api/session-note/draft`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Beeps could not prepare the session-note draft.");
  return payload;
}
