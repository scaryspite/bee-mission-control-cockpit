import test from "node:test";
import assert from "node:assert/strict";
import { inferBeepsNavigation, needsWorkGrounding } from "../src/data/beepsNavigation.js";
import { appLinks } from "../src/data/appLinks.js";

const rooms = [
  { id: "bridge", title: "Command Deck" },
  { id: "bee-brain", title: "Memory Core" },
  { id: "creative-lab", title: "Creative Lab" },
  { id: "work", title: "Operations Engine" },
  { id: "school", title: "Learning Observatory" },
];

test("routes project status questions to the Memory Core terminal", () => {
  assert.deepEqual(inferBeepsNavigation("Where is the current Game Hub status?", rooms), {
    roomId: "bee-brain",
    stationId: "memory-terminal",
  });
});

test("routes material drafting to the Creative Lab workbench", () => {
  assert.deepEqual(inferBeepsNavigation("Draft a Joke Detective scenario for BeGo", rooms), {
    roomId: "creative-lab",
    stationId: "creative-notes",
  });
});

test("routes session-note requests to the protected Work console", () => {
  assert.deepEqual(inferBeepsNavigation("Prepare a session note from today's observations", rooms), {
    roomId: "work",
    stationId: "operations-console",
  });
});

test("routes school requests to the Learning Observatory desk", () => {
  assert.deepEqual(inferBeepsNavigation("Help me understand the assignment rubric", rooms), {
    roomId: "school",
    stationId: "school-desk",
  });
});

test("routes desktop and Nebs requests to the Cosmic Desktop", () => {
  const allRooms = [...rooms, { id: "desktop-space", title: "Cosmic Desktop" }];
  assert.deepEqual(inferBeepsNavigation("Go to the desktop space with Nebs", allRooms), {
    roomId: "desktop-space",
    stationId: "desktop-nebs",
  });
});

test("leaves ordinary conversation in place", () => {
  assert.equal(inferBeepsNavigation("hi", rooms), null);
  assert.equal(needsWorkGrounding("hi"), false);
});

test("grounds work and project requests while leaving school chat ungrounded", () => {
  // Casual project status — no drafting verb, should NOT be work-grounded
  assert.equal(needsWorkGrounding("What is the current Game Hub project status?"), false);
  assert.equal(needsWorkGrounding("Help me plan my study week"), false);
  assert.equal(needsWorkGrounding("How did it go with BeGo?"), false);
  assert.equal(needsWorkGrounding("Tell me about MiLy's materials"), false);
  assert.equal(needsWorkGrounding("My inbox is a mess"), false);
  assert.equal(needsWorkGrounding("How did work go?"), false);
  // Explicit material creation — HAS drafting verb + work content → should be grounded
  assert.equal(needsWorkGrounding("Draft a MiLy scenario card from her current program"), true);
  assert.equal(needsWorkGrounding("Make a BeGo session note from today's data"), true);
  assert.equal(needsWorkGrounding("Create a client game worksheet"), true);
  assert.equal(needsWorkGrounding("Generate a joke detective card"), true);
  // Explicit email retrieval — HAS retrieval verb + email keyword → should be grounded
  assert.equal(needsWorkGrounding("Search my work mail for the intake summary"), true);
  assert.equal(needsWorkGrounding("Find emails from this week in my inbox"), true);
});

test("does not send casual client and project mentions to creative-lab", () => {
  // No drafting verb → no creative-lab routing
  assert.equal(inferBeepsNavigation("What's going on with MiLy?", rooms), null);
  assert.equal(inferBeepsNavigation("Tell me about the materials", rooms), null);
  // "today" in the phrase routes to bridge (which is fine), but NOT creative-lab
  const begoResult = inferBeepsNavigation("How did BeGo go today?", rooms);
  assert.ok(begoResult === null || begoResult.roomId !== "creative-lab",
    "Casual BeGo mention with 'today' should not route to creative-lab");
});

test("sends explicit drafting requests to creative-lab", () => {
  assert.deepEqual(inferBeepsNavigation("Create a scenario card for BeGo", rooms), {
    roomId: "creative-lab",
    stationId: "creative-notes",
  });
  assert.deepEqual(inferBeepsNavigation("Make a worksheet for MiLy", rooms), {
    roomId: "creative-lab",
    stationId: "creative-notes",
  });
});

test("launches the Game Hub child app through its canonical entry point", () => {
  assert.equal(appLinks.gameHub.url, "https://gamehub.beemissioncontrol.com");
  assert.equal(appLinks.gameHub.statusUrl, "https://gamehub.beemissioncontrol.com/api/status");
});

