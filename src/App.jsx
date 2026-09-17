import { useCallback, useEffect, useState } from "react";
import Beeps from "./components/Beeps";
import CrewActors from "./components/CrewActors";
import PrivateGate from "./components/PrivateGate";
import { PublicHome, PrivacyPolicy, TermsOfService } from "./components/PublicSite";
import { appLinks } from "./data/appLinks";
import { applyBeepsAction, formatActionPreview, formatAppliedAction, previewBeepsAction } from "./data/actionClient";
import { askBeeBrain, getBeeBrainStatus, getBeepsDailyBrief, getBeepsWorkIntake, recordBeepsContext } from "./data/navigatorClient";
import { draftBeepsSessionNote } from "./data/sessionNoteClient";
import { inferBeepsNavigation, needsWorkGrounding } from "./data/beepsNavigation";
import { shipRooms } from "./data/shipSystems";

function App() {
  const [selectedRoomId, setSelectedRoomId] = useState("bridge");
  const [brainStatus, setBrainStatus] = useState({ state: "checking" });
  const [navigationRequest, setNavigationRequest] = useState(null);
  const activeRoom = shipRooms.find((room) => room.id === selectedRoomId) ?? shipRooms[0];

  const handleRoomChange = (roomId) => {
    setSelectedRoomId(roomId);
  };

  const requestBeepsNavigation = (request, options = {}) => {
    const destination = inferBeepsNavigation(request, shipRooms);
    if (!destination) return null;
    setSelectedRoomId(destination.roomId);
    setNavigationRequest({ ...destination, ...options, request, token: Date.now() });
    return destination;
  };

  const rememberBeeps = useCallback(async (event) => {
    try {
      await recordBeepsContext(event);
    } catch {
      // Context memory must never interrupt the work Bee is doing.
    }
  }, []);

  const handleSessionNoteDraft = async (input) => {
    const draft = await draftBeepsSessionNote(input);
    void rememberBeeps({
      eventType: "session_note_draft",
      area: "clinical",
      client: input.client,
      request: input.currentObservations,
      response: draft.markdown || draft.copyBoxes?.map((box) => `${box.label}: ${box.value}`).join("\n\n") || "Session-note draft created.",
      sourcePaths: [...(draft.sourcePaths || []), ...(draft.priorContextPaths || [])],
      modelStatus: draft.modelStatus,
    });
    return draft;
  };

  const formatDailyBrief = (brief, timezone) => {
    if (brief.unavailable) {
      return `Calendar is not available yet. ${brief.reason || "The protected connector needs attention."}`;
    }

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    });
    const events = (brief.events || []).map((event) => {
      const start = timeFormatter.format(new Date(event.start));
      const end = timeFormatter.format(new Date(event.end));
      return `- ${start}–${end} / ${event.title}`;
    });
    const attention = brief.needsAttention?.length
      ? `\nAttention:\n${brief.needsAttention.map((item) => `- ${item}`).join("\n")}`
      : "\nNo calendar conflicts found.";
    const schedule = events.length ? events.join("\n") : "- Nothing scheduled.";

    return [
      `Today / ${brief.date}`,
      `${brief.eventCount} scheduled event${brief.eventCount === 1 ? "" : "s"}.`,
      "",
      schedule,
      attention,
      "",
      "Source: Google Calendar (read-only)",
    ].join("\n");
  };

  const formatWorkIntake = (intake) => {
    if (intake.unavailable) {
      return `Work intake is not available yet. ${intake.reason || "The protected Gmail connector needs attention."}`;
    }
    return [
      "Work intake / last 14 days",
      `${intake.resultCount} work message summar${intake.resultCount === 1 ? "y" : "ies"} surfaced.`,
      `${intake.actionable?.length ?? 0} marked for attention; ${intake.references?.length ?? 0} reference${intake.references?.length === 1 ? "" : "s"}.`,
      "",
      "Message details stay in Gmail and are not copied into Bee Brain context.",
      "Source: Gmail (read-only)",
    ].join("\n");
  };

  const refreshBrainStatus = useCallback(async (silent = false) => {
    if (silent !== true) {
      setBrainStatus({ state: "checking" });
    }
    try {
      const status = await getBeeBrainStatus();
      setBrainStatus({ state: status.sourceSetValid ? "connected" : "degraded", status });
    } catch (error) {
      setBrainStatus({
        state: "offline",
        message: error instanceof Error ? error.message : "Bee Brain is unavailable.",
      });
    }
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void refreshBrainStatus();
    }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [refreshBrainStatus]);

  useEffect(() => {
    if (brainStatus.state !== "offline") return;
    const pollInterval = window.setInterval(() => {
      void refreshBrainStatus(true);
    }, 2000);
    return () => window.clearInterval(pollInterval);
  }, [brainStatus.state, refreshBrainStatus]);

  const handleBeepsCommand = async (command, chatContext = {}) => {
    const normalized = command.trim().toLowerCase();
    const requestedRoom = shipRooms.find((room) =>
      [room.title, room.title.replace(" Deck", ""), room.title.replace(" Core", ""), room.id]
        .map((value) => value.toLowerCase())
        .some((alias) => normalized.includes(alias)),
    );

    if (requestedRoom && /\b(go|open|enter|take me|move|head)\b/.test(normalized)) {
      requestBeepsNavigation(command);
      return `Routing to ${requestedRoom.title}.`;
    }

    requestBeepsNavigation(command);

    if (/(what matters|what's happening|what is happening|morning brief|daily brief|today's schedule|todays schedule|my schedule|calendar)/i.test(command)) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Detroit";
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      try {
        const brief = await getBeepsDailyBrief({ date, timezone });
        return formatDailyBrief(brief, timezone);
      } catch (error) {
        return `I couldn't read today's calendar. ${error instanceof Error ? error.message : "The protected Calendar connector needs attention."}`;
      }
    }

    if (/(work intake|work email|work messages|what needs attention at work|check work)/i.test(command)) {
      try {
        return formatWorkIntake(await getBeepsWorkIntake());
      } catch (error) {
        return `I couldn't read the work intake. ${error instanceof Error ? error.message : "The protected Gmail connector needs attention."}`;
      }
    }

    if (/^(create|save|write)\s+(a\s+)?(draft|draft brief|material draft)/.test(normalized)) {
      try {
        return formatAppliedAction(await applyBeepsAction(command, "draft_material"));
      } catch (error) {
        return `Draft could not be created. ${error instanceof Error ? error.message : "Try the preview first."}`;
      }
    }

    if (/^(prepare|save|write)\s+(a\s+)?(game hub|game-hub)\s+(patch|update|proposal)/.test(normalized)) {
      try {
        return formatAppliedAction(await applyBeepsAction(command, "update_game_hub"));
      } catch (error) {
        return `Game Hub proposal could not be created. ${error instanceof Error ? error.message : "Try the preview first."}`;
      }
    }

    if (/\b(draft|make|create|build|give me)\b/.test(normalized) && /material|card|worksheet|deck|packet|scenario|joke detective|social detective/.test(normalized)) {
      try {
        return formatActionPreview(await previewBeepsAction(command, "draft_material"));
      } catch (error) {
        return `Draft preview unavailable. ${error instanceof Error ? error.message : "Try opening Bee Brain Navigator."}`;
      }
    }

    if (/\b(update|change|add|modify)\b/.test(normalized) && /game hub|bego|mily|game/.test(normalized)) {
      try {
        return formatActionPreview(await previewBeepsAction(command, "update_game_hub"));
      } catch (error) {
        return `Game Hub preview unavailable. ${error instanceof Error ? error.message : "Try opening Bee Brain Navigator."}`;
      }
    }

    try {
      const result = await askBeeBrain(
        command,
        "model",
        chatContext.conversation ?? [],
        chatContext.sourceMode ?? "auto",
        chatContext.groundingScope ?? (chatContext.sourceMode ? (needsWorkGrounding(command) ? "work" : "conversation") : "auto"),
        chatContext.attachmentContext ?? "",
        chatContext.conversationId ?? null,
      );
      return result;
    } catch (error) {
      return `I couldn't reach Bee Brain. ${error instanceof Error ? error.message : "Try opening the Navigator."}`;
    }
  };

  const hostname = window.location.hostname;

  if (hostname === "beemissioncontrol.com") {
    return <PublicHome />;
  }

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/home") return <PublicHome />;
  if (pathname === "/privacy") return <PrivacyPolicy />;
  if (pathname === "/terms") return <TermsOfService />;

  return (
    <PrivateGate>
      <main className="haunted-bridge" data-room={activeRoom.id}>
        <div className="bridge-shell">
          <section
            className="room-scene"
            data-room={activeRoom.id}
            data-tone={activeRoom.tone}
            aria-label={`${activeRoom.title} room`}
          >
            <nav className="room-nav room-nav--integrated" aria-label="Mission Control rooms">
              <div className="room-nav-list">
                {shipRooms.map((room, index) => (
                  <button
                    className="room-nav-button"
                    data-active={room.id === activeRoom.id}
                    data-tone={room.tone}
                    key={room.id}
                    type="button"
                    aria-pressed={room.id === activeRoom.id}
                    onClick={() => handleRoomChange(room.id)}
                  >
                    <span className="room-nav-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="room-nav-copy">
                      <strong>{room.title}</strong>
                      <small>{room.subtitle}</small>
                    </span>
                  </button>
                ))}
              </div>
            </nav>

            <div className="room-layout">
            <Beeps
                room={activeRoom.title}
                roomId={activeRoom.id}
                onCommand={handleBeepsCommand}
                navigationRequest={navigationRequest}
                onRequestNavigation={requestBeepsNavigation}
                onSessionNoteDraft={handleSessionNoteDraft}
                onContextEvent={rememberBeeps}
              />
            </div>

            <div className="room-status-stamp" aria-label={`${activeRoom.title} status`}>
              <span>{activeRoom.status}</span>
              <strong>{activeRoom.subtitle}</strong>
            </div>

            <CrewActors />
          </section>

          <nav className="cockpit-dock" aria-label="Connected systems">
            <span className="cockpit-dock-label">Connected systems</span>
            <button className="cockpit-dock-action" type="button" onClick={refreshBrainStatus}>
              Bee Brain access
            </button>
            <div className="brain-access-status" role="status" aria-live="polite" data-state={brainStatus.state}>
              <span className="brain-access-dot" aria-hidden="true" />
              <strong>
                {brainStatus.state === "checking" && "Bee Brain checking"}
                {brainStatus.state === "connected" && "Bee Brain connected"}
                {brainStatus.state === "degraded" && "Bee Brain needs review"}
                {brainStatus.state === "offline" && "Bee Brain unavailable"}
              </strong>
              {brainStatus.state === "connected" && (
                <span>{brainStatus.status.approvedEntries} approved sources</span>
              )}
              {brainStatus.state === "offline" && <span>{brainStatus.message}</span>}
              <button type="button" onClick={refreshBrainStatus} aria-label="Refresh Bee Brain status">Refresh</button>
            </div>
            {appLinks.gameHub.url ? (
              <a href={appLinks.gameHub.url} target="_blank" rel="noreferrer">Game Hub</a>
            ) : (
              <span className="cockpit-dock-link cockpit-dock-link--pending" title="The independent Game Hub domain still needs confirmation">
                Game Hub / domain pending
              </span>
            )}
          </nav>

          <footer className="cockpit-footer">
            <span>LOCAL / PRIVATE / CAPTAIN ONLY</span>
            <span>THE FUTURE WAS SUPPOSED TO BE MAGICAL. SO WE KEPT THE MAGIC OURSELVES.</span>
          </footer>
        </div>
      </main>
    </PrivateGate>
  );
}

export default App;
