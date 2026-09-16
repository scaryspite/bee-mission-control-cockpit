const defaultRoomStations = {
  bridge: "bridge-console",
  "bee-brain": "memory-terminal",
  "creative-lab": "creative-notes",
  work: "operations-console",
  school: "school-desk",
  "desktop-space": "desktop-nebs",
};

const routes = [
  {
    // Work room: session notes and explicit work-email retrieval.
    // Casual mentions of "client" or "program" without clinical/work intent stay in chat.
    roomId: "work",
    stationId: "operations-console",
    pattern: /session note|data sheet|work intake|work email|work message|shadow training/,
  },
  {
    roomId: "desktop-space",
    stationId: "desktop-nebs",
    pattern: /desktop|nebs|space dog|cosmic desktop|stage manager|desktop files/,
  },
  {
    roomId: "bee-brain",
    stationId: "memory-terminal",
    pattern: /bee brain|source|memory|context|where is|find|locate|current status|project status/,
  },
  {
    roomId: "school",
    stationId: "school-desk",
    pattern: /school|assignment|course|class|reading|study|homework|rubric|syllabus/,
  },
  {
    // Creative lab: only when there is an explicit drafting/creation verb alongside the content word.
    // Casual mentions of "bego", "mily", "material", or "card" without drafting intent stay in chat.
    roomId: "creative-lab",
    stationId: "creative-notes",
    pattern: /(?:draft|create|make|build|write|generate|prepare|update)\b.{0,60}(?:material|card|worksheet|deck|packet|scenario|game hub|prototype)|(?:material|card|worksheet|deck|packet|scenario|game hub|prototype)\b.{0,60}(?:draft|create|make|build|write|generate|prepare|update)/,
  },
  {
    roomId: "bridge",
    stationId: "bridge-console",
    pattern: /what matters|morning brief|daily brief|today|calendar|schedule|priority|mission|ship status/,
  },
];

export function inferBeepsNavigation(request, rooms) {
  const normalized = request.trim().toLowerCase();
  if (!normalized || !Array.isArray(rooms)) return null;

  const explicitRoom = rooms.find((room) => {
    const aliases = [room.title, room.title.replace(" Deck", ""), room.title.replace(" Core", ""), room.id]
      .map((value) => value.toLowerCase());
    return aliases.some((alias) => normalized.includes(alias));
  });
  if (explicitRoom && /\b(go|open|enter|take me|move|head)\b/.test(normalized)) {
    return { roomId: explicitRoom.id, stationId: defaultRoomStations[explicitRoom.id] };
  }

  const route = routes.find((candidate) => candidate.pattern.test(normalized));
  return route ? { roomId: route.roomId, stationId: route.stationId } : null;
}

// Mirrors the server-side isExplicitWorkRequest() guard: only return true when there is
// a clear drafting/creation verb AND a work-content keyword, or an explicit email-retrieval
// verb pattern. This prevents casual mentions of client names, "work", "code", "project",
// "bego", or "mily" from pre-declaring groundingScope: "work" before the server router runs.
export function needsWorkGrounding(request) {
  const value = request.toLowerCase();
  const hasDraftingVerb = /\b(draft|create|make|write|build|generate|update|prepare)\b/.test(value);
  const hasWorkContent = /\b(material|session note|session narrative|data sheet|game hub update|joke detective|scenario card|client game|worksheet|run sheet)\b/.test(value);
  const hasGmailRetrieval = /\b(search|find|pull|read|check|look up|show|get|fetch)\b/.test(value)
    && /\b(work mail|gmail|inbox|emails?)\b/.test(value);
  return (hasDraftingVerb && hasWorkContent) || hasGmailRetrieval;
}

