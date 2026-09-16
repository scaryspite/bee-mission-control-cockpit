# Beeps asset inventory — rebuild pass

The room art is the visual source of truth. Separate sprite assets exist only for:

- a state that changes after an interaction;
- an object Beeps must visibly hold;
- foreground furniture that is genuinely absent from the room art; or
- a Beeps action pose whose perspective must match a particular room surface.

## Animation

- Idle: neutral plus blink/settle frame.
- Walking: left and right, two real opposite-step frames each. No CSS mirroring.
- Actions: one stable full-body pose per action. Prop-use poses do not alternate unless a second frame has materially different limb placement.

## Action pose and prop coverage

| Room | Room-surface interaction | Beeps action art | State/held asset |
| --- | --- | --- | --- |
| Command Deck | compact console on left counter | actor-only console operation from the floor | panel indicators / compact tool card if held |
| Command Deck | right-side alcove rest chair / chat-side tactical coffee | actor-only seated rest / seated chair drink | red/tan chair owns the idle turquoise mug; coffee is a chat-side interaction target, and the active seated drink composition owns the temporary held mug |
| Memory Core | archive shelves | reach-and-pull file | thin archive file, disk, drawer-open state |
| Memory Core | inset archive terminal | face-left terminal operation | terminal display state |
| Memory Core | open right-side floor bay | auxiliary console operation | freestanding console and one matching full-composition pose |
| Creative Lab | left workbench | lean-left sketch/build pose | folded plans, disk, small prototype tool |
| Creative Lab | beanbag nook | beanbag rest pair / seated game pose | Bean Bag rest owns its full composition; Game Boy remains a separate handheld action |
| Operations Engine | long workbench panels | lean-left diagnostic pose | loose tool roll / panel state |
| Operations Engine | floor-level right maintenance bay | kneel-right hatch/service pose | open hatch appears only during service; no loose closed hatch floats on the counter |
| Learning Observatory | left study wall/desk | wooden desk prop with one stable actor-only left-facing reading pose | notebook and floppy/disk |
| Learning Observatory | observatory chair | purple moon chair with a single actor-only comfy-read pose | seated reading posture; no separate floating book |
| Learning Observatory | large star window | right/window-side telescope anchor with actor-only telescope stance | telescope remains visible and faces right toward the star window |

No generic floating desks, shelves, consoles, or open books are allowed. Any generated prop must be built from the appropriate room background's worn industrial pixel language and exact viewing angle.
