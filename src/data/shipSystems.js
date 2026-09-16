export const bridgeStatus = {
  ship: "Operational-ish",
  captain: "Bee",
  access: "Private single-captain vessel",
  source: "Bee Brain has final authority",
  currentMission: "Build the cockpit without flattening the ship into a dashboard.",
  transmission:
    "Captain present. Systems mostly cooperating. The door has opinions, but the lock still works.",
};

export const shipRooms = [
  {
    id: "bridge",
    title: "Command Deck",
    subtitle: "Night Shift // Bridge",
    atmosphere: "the bridge of a strange old ship",
    purpose: "The captain arrives here first.",
    status: "Home",
    tone: "bridge",
    contains: ["current mission", "ship status", "room navigation"],
    objects: ["CRT mission monitor", "captain's notes", "desk console"],
    beepsBehavior: "monitoring the controls and pretending the coffee is tactical",
    quickAccess: ["current mission", "ship status", "room directory", "crew log"],
    description:
      "Old monitors, ship noise, personal stickers, and enough stubbornness to keep the future magical anyway.",
    beepsState: "idle",
    beepsMessage: "Captain present. Systems mostly cooperating.",
  },
  {
    id: "bee-brain",
    title: "Memory Core",
    subtitle: "Source Authority // Bee Brain",
    atmosphere: "an old glowing archive room",
    purpose: "The archive where truth lives.",
    status: "Authority",
    tone: "source",
    contains: ["sources", "project memory", "archive sector"],
    objects: ["archive shelves", "file terminal", "old monitors"],
    beepsBehavior: "searching, reading, and organizing the things that still matter",
    quickAccess: ["source index", "project memory", "archive sector", "retrieval"],
    description:
      "The cockpit can summarize, decorate, and point, but when the Memory Core disagrees, the Memory Core wins. Its quieter archive sector holds old projects, retired systems, and previous versions.",
    beepsState: "searching",
    beepsMessage: "Source confirmed. The archive has the final word.",
  },
  {
    id: "creative-lab",
    title: "Creative Lab",
    subtitle: "Prototype Sector // Imagination",
    atmosphere: "a messy inventor room in orbit",
    purpose: "The room where impossible ideas become real.",
    status: "Useful chaos",
    tone: "creative",
    contains: ["materials", "designs", "build experiments"],
    objects: ["prototype shelf", "loose sketches", "tool cart"],
    beepsBehavior: "checking a prototype that probably should not be sparking",
    quickAccess: ["active build", "materials", "experiments", "prototype shelf"],
    description:
      "Half-finished inventions, magical-girl energy, and prototypes that may be brilliant if nobody looks too closely yet.",
    beepsState: "success",
    beepsMessage: "Three abandoned ideas detected. One may be load-bearing.",
  },
  {
    id: "work",
    title: "Operations Engine",
    subtitle: "Serious Mode // Work Bay",
    atmosphere: "a serious machine room",
    purpose: "Important execution and infrastructure.",
    status: "Serious mode",
    tone: "serious",
    contains: ["scheduling", "training", "fieldwork"],
    objects: ["warning panel", "run board", "maintenance console"],
    beepsBehavior: "focused at the machine controls with jokes temporarily muted",
    quickAccess: ["today's run", "scheduling", "training", "fieldwork"],
    description:
      "The industrial deck keeping adulthood from eating the captain alive. Accuracy matters here, so the jokes stay quiet.",
    beepsState: "serious",
    beepsMessage: "Operational parameters updated. Humor systems reduced.",
  },
  {
    id: "school",
    title: "Learning Observatory",
    subtitle: "Late Night Studies // School Deck",
    atmosphere: "a study room looking into space",
    purpose: "School, study, and growth.",
    status: "Active",
    tone: "study",
    contains: ["coursework", "reading guides", "academic planning"],
    objects: ["study lamp", "reading stack", "star map"],
    beepsBehavior: "thinking beside the notes until the assignment gives up first",
    quickAccess: ["current class", "coursework", "reading guides", "academic plan"],
    description:
      "Syllabus glow, research notes, tired ambition, and the soft panic of opening a calendar.",
    beepsState: "thinking",
    beepsMessage: "Assignment located. Syllabus damage remains unmeasured.",
  },
  {
    id: "desktop-space",
    title: "Cosmic Desktop",
    subtitle: "Nebs & Starfield // Desktop Horizon",
    atmosphere: "cosmic nebula with Nebs in center, dev apps on the left, and mission files on the right",
    purpose: "Synchronize Beeps with the live desktop environment.",
    status: "Synchronized",
    tone: "bridge",
    contains: ["apps", "nebs", "desktop files"],
    objects: ["stage manager console", "nebs cosmic perch", "file vaults"],
    beepsBehavior: "patrolling between dev apps on the left, Nebs in the center, and files on the right",
    quickAccess: ["apps", "nebs", "files", "desktop pet"],
    description:
      "The captain's actual desktop space: Stage Manager apps on the left, Nebs holding the cosmic center, and mission vaults on the right.",
    beepsState: "idle",
    beepsMessage: "Desktop horizon clear. Apps on the left, Nebs in center, files on the right.",
  },
];

export const cockpitModules = {
  run: {
    label: "Current Run",
    eyebrow: "Captain's active channel",
    heading: "Keep the next useful thing within reach.",
    copy: "A calm command strip for the work in front of you. It is not a task manager; it is the ship's honest readout.",
    fields: [
      ["Mission", "Build the cockpit without flattening the ship into a dashboard."],
      ["Route", "Work → materials → learning → life admin"],
      ["Signal", "Choose one next action, then stop making the console perform anxiety."],
    ],
  },
  source: {
    label: "Bee Brain",
    eyebrow: "Source authority channel",
    heading: "The cockpit can point. Bee Brain decides.",
    copy: "This room is the experience layer. The Bee Brain remains the read-only source of truth for memory, notes, context, and recovered project evidence.",
    fields: [
      ["Authority", "Bee Brain has final say when summaries disagree."],
      ["Boundary", "Local/private captain system. No client-facing material lives here."],
      ["Mode", "Source-aware, not source-replacing."],
    ],
  },
  vessels: {
    label: "Docking Bay",
    eyebrow: "Separate child applications",
    heading: "Useful vessels stay separate from the bridge.",
    copy: "These launch points are intentionally not merged into Mission Control. Their audiences and responsibilities remain distinct.",
    fields: [
      ["Game Hub", "Client-facing recreation vessel."],
      ["Bridge status", "Private single-captain vessel. No deployment state implied."],
    ],
  },
};

export const dockingVessels = [
  {
    id: "game-hub",
    title: "Recreation Vessel",
    subtitle: "Visitor Safe // Game Hub",
    status: "Client-facing",
    tone: "external",
    description:
      "The public-safe launch vessel for games. It stays separate from the private bridge and remains client-facing.",
    boundary: "Separate child app. Client-facing.",
  },
];
