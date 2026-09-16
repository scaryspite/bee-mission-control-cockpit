# Cockpit Visual Mapping Packet

This document records the visual placement packet used for the current room layer.

## Production rule

The room background is the visual source of truth. The reference screenshots may show dashed mapping bounds, labels, floor markers, or colored placement halos; those are authoring guides and must not ship as interface decoration.

The production stage uses percentage coordinates against the full room viewport. The room background is edge-to-edge, and Beeps plus foreground props scale with that stage. Keep the source backgrounds at their native 1672 x 941 composition when adjusting placement.

## Room map

| Room | Station | Current interaction assets | Intended action |
| --- | --- | --- | --- |
| Command Deck | Control panel | Original composed scene: `command-deck-beeps.png` | Use the desk console already embedded in the original Command Deck composition |
| Command Deck | Tactical coffee / Rest chair | Original composed scene: `command-deck-beeps.png` | Use the baked coffee and captain chair; no foreground replacement or pose swap is rendered |
| Memory Core | Bookcase | Room-owned archive wall | Use the stocked archive wall already drawn into the room; a dedicated retrieval pose is still needed before adding an active foreground scene |
| Memory Core | Control panel | `beeps-interaction-archive-terminal-tight.png` / `beeps-pose-memory-terminal-v2.png` | Work at the inset archive terminal with the compact surface-mounted pose |
| Memory Core | Auxiliary console | `beeps-prop-command-deck-console-v4.png` / `beeps-pose-command-deck-console-v2.png` | Operate the freestanding console in the open right-side floor bay |
| Memory Core | Memory window | Room-owned porthole surface | Move to the memory window with no duplicate foreground window |
| Creative Lab | Workbench notes | Room-owned workbench | Use the real workbench in the room plate; a dedicated workbench pose is still needed before adding an active foreground scene |
| Creative Lab | Bean bag | `beeps-prop-creative-beanbag-v4.png` / `beeps-pose-beanbag-idle-a-v2.png` / `...b-v2.png` | Rest in the bean bag; the full replacement owns the furniture during the action |
| Creative Lab | Game Boy | `beeps-prop-creative-handheld-v6.png` / `beeps-pose-beanbag-play-v2.png` / `...b-v3.png` | Use the handheld in the separate play state |
| Operations Engine | Desk panels | Room-owned diagnostic-panel bank | Use the panel bank and counter already drawn into the room; a matching actor-only pose is still needed before adding an active foreground scene |
| Operations Engine | Maintenance hatch | `beeps-prop-operations-hatch-open-v4.png` (active state only) / `beeps-pose-operations-hatch-v2.png` | Kneel and service the floor-level hatch in the right maintenance bay |
| Learning Observatory | Study desk | `beeps-interaction-study-desk-tight.png` | Keep the wooden desk as a foreground prop on the left-side study wall; hold Beeps' ambient stance until a matching left-facing desk pose is created |
| Learning Observatory | Observatory chair | `beeps-prop-observatory-chair-matched-v4.png` / `beeps-pose-comfy-read.png` | Keep the purple moon chair visible; use one stable seated reading pose with no separate floating book |
| Learning Observatory | Observation telescope | `beeps-prop-observatory-telescope-v5.png` / `beeps-pose-telescope.png` | Keep the large telescope at the right/window-side anchor; Beeps looks right toward the star window with one stable pose |

## Baked-scene audit

- `command-deck-beeps.png` is the recovered original 1672 x 941 Command Deck composition. It already contains Beeps, the captain chair, coffee, and console in the same lighting and perspective as the room.
- Command Deck now uses that composed scene directly. Its station targets remain interactive, but the room owns their visuals and no second foreground Beeps or console screen glow is rendered.
- No matching earlier composed room plates were recovered for Memory Core, Creative Lab, Operations Engine, or Learning Observatory. Those rooms remain on their current dedicated plates until purpose-built replacements are created; unrelated props are not being substituted as fake background repairs.

### Console ownership note

`beeps-prop-command-deck-console-v4.png` is a separate tall floor-console asset. It is intentionally not assigned to the Command Deck counter. It is now assigned to the open right-side floor bay in Memory Core, with `beeps-pose-command-deck-console-v2.png` as its single stable active composition. The room-by-room scale pass remains separate.

## Layout constraint resolved

The room scene now owns the viewport rather than sitting inside a bordered, aspect-ratio-limited card. This keeps the screenshot coordinate system useful at desktop sizes while preserving the existing mobile stack. The chat, system access status, and connected-system links remain overlays or downstream mobile content; they do not change the room's station coordinate system.

## Chair placement rule

The Command Deck uses its original full composition instead of an empty room plate plus separated furniture. The desk, chair, coffee, and Beeps already share the same lighting, scale, and perspective, so its hotspots are now room-owned and no foreground actor is rendered on top. Other seating remains room-specific: the Learning Observatory chair and Creative Lab bean bag are not moved by this Command Deck correction.

## Do not add

- Screenshot mapping guides to production rooms.
- Generic floating furniture that is already part of a room background.
- A second source of truth for station coordinates.
- New props without a matching room surface, action pose, and interaction purpose.
