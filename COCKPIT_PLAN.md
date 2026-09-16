# Bee Mission Control Cockpit Plan

## Phase

Phase 2: Mission Control Experience

This phase creates the cockpit/personality layer for Bee Mission Control.

This phase does not:
- migrate files
- rebuild Bee Brain Navigator
- flatten systems
- publish or deploy anything
- make a generic dashboard

## Cockpit Role

The cockpit is the front-facing command deck for Bee Mission Control.

It should help Bee see:
- what system they are in
- what the current mission is
- where the source of truth lives
- what child apps exist
- what is active, paused, broken, or needs attention

## System Boundaries

### Bee Mission Control

Parent operating system / command center.

### Bee Brain

Knowledge, context, memory, notes, and source authority layer.

### Bee Brain Navigator

Local read-only retrieval prototype.

The Navigator is not the cockpit.
The Navigator is a brain module/testing interface.

### iCloud

Storage layer.

### Game Hub

Separate active child app.

## Cockpit Panels

### 1. Ship Systems

Purpose:
Show local/private system status and boundaries.

Must show:
- local-only status
- private system reminder
- no deployment status
- source authority reminder

### 2. Current Run

Purpose:
Show the daily operating flow.

Can include:
- today’s focus
- school
- work
- materials
- fieldwork
- life admin
- active mission
- next action

### 3. Bee Brain

Purpose:
Point to the knowledge/source layer.

Must preserve:
- source visibility
- read-only retrieval boundaries
- distinction between cockpit and truth layer

### 4. Child Apps

Purpose:
Show active separate apps without merging them into the cockpit.

Current child app:
- Game Hub

### 5. Gremlin Console

Purpose:
Show assistant state and personality.

The gremlin can comment on status.
The gremlin cannot become the authority.

## Assistant Personality Rules

The assistant is:
- competent
- dramatic
- mildly exhausted
- loyal
- a little rude

The assistant is not:
- Clippy
- a waifu
- a corporate helper
- the boss
- the source of truth

## Serious Mode

Serious mode turns jokes off for:
- clinical work
- compliance
- safety
- money
- scheduling
- source-authority questions

Serious mode messages should be plain, direct, and useful.

## Core Line

“The future was supposed to be magical. It wasn’t. So we kept the magic ourselves.”

## Design Test

A cockpit feature passes if it makes the system:
- clearer
- easier to navigate
- more Bee
- still usable when tired
- still respectful of source authority

A cockpit feature fails if it:
- hides important information
- makes the system feel generic
- turns Bee Brain into decoration
- turns the gremlin into the boss
- makes the page harder to use
