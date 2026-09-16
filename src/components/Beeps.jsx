import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Beeps.css";
import BeepsMotion from "./BeepsMotion";
import SessionNoteComposer from "./SessionNoteComposer";
import { beepsModelPoses, beepsPoseRegistry, beepsRooms } from "../data/beepsData.jsx";
import { extractBeepsAttachments, openBeepsStream } from "../data/navigatorClient";

const stateAssets = {
  idle: "/assets/pet-frame-idle-a.png",
  searching: "/assets/pet-frame-work-a.png",
  thinking: "/assets/pet-frame-thinking-a.png",
  success: "/assets/pet-frame-cheer-a.png",
  error: "/assets/beeps-state-error.png",
  serious: "/assets/pet-frame-work-a.png",
};

const ambientGroundRatios = {
  idle: 0.015,
  searching: 0.029,
  thinking: 0.029,
  success: 0.029,
  error: 0.03,
  serious: 0.025,
};

const walkGroundRatios = {
  front: 0.109,
  left: 0.019,
  right: 0.019,
  back: 0.019,
};

const wanderBounds = {
  bridge: { min: 18, max: 84 },
  "bee-brain": { min: 18, max: 86 },
  "creative-lab": { min: 28, max: 88 },
  work: { min: 18, max: 86 },
  school: { min: 18, max: 88 },
};

const fallbackRoom = {
  message: "Still running. Surprisingly.",
  state: "idle",
  accent: "#79d7e5",
  stage: { home: { x: 72, floor: 5 }, stations: [] },
};

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Beeps could not read ${file.name}.`));
    reader.onload = () => resolve(String(reader.result).split(",").at(-1) || "");
    reader.readAsDataURL(file);
  });
}

function broadcastBeepsSync(action, label = "", text = "") {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("beeps_sync");
      channel.postMessage({
        type: "beeps_action",
        action,
        label: label || "",
        text: text || label || "",
      });
      channel.close();
      // eslint-disable-next-line no-unused-vars
    } catch (_) { /* ignore */ }
  }
}

export default function Beeps({
  room = "Command Deck",
  roomId = "bridge",
  onCommand,
  navigationRequest,
  onRequestNavigation,
  onSessionNoteDraft,
  onContextEvent,
}) {
  const roomData = beepsRooms[room] ?? fallbackRoom;
  const home = roomData.stage?.home ?? fallbackRoom.stage.home;
  const stations = useMemo(() => roomData.stage?.stations ?? [], [roomData]);
  const [actorPosition, setActorPosition] = useState(home);
  const [moving, setMoving] = useState(false);
  const [walkDuration, setWalkDuration] = useState(850);
  const [facing, setFacing] = useState("front");
  const [activeStationId, setActiveStationId] = useState("");
  const [commandOpen, setCommandOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [noteComposerOpen, setNoteComposerOpen] = useState(false);
  const [notePending, setNotePending] = useState(false);
  const [command, setCommand] = useState("");
  const [pendingMessage, setPendingMessage] = useState("Let me pull the right thread.");
  const [streamedText, setStreamedText] = useState("");
  const [messages, setMessages] = useState([
    { id: "welcome", role: "beeps", text: "I’m here. Ask about a project, source, next step, or draft." },
  ]);
  const [commandPending, setCommandPending] = useState(false);
  const [modelPoseState, setModelPoseState] = useState(null);
  const [selectedPoseKey, setSelectedPoseKey] = useState(null);
  const [, setActiveThoughts] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [bubble, setBubble] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem("cockpit_voice_enabled") !== "false";
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const preferredVoiceRef = useRef(null);
  const movementTimer = useRef();
  const bubbleTimer = useRef();
  const wanderTimer = useRef();
  const modelPoseTimer = useRef();
  const handledNavigationRef = useRef(0);
  const attachmentInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("cockpit_voice_enabled", voiceEnabled ? "true" : "false");
    if (!voiceEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const updateVoices = () => {
      const all = window.speechSynthesis.getVoices() || [];
      preferredVoiceRef.current =
        all.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
        all.find((v) => /samantha|victoria|karen|zoe|fiona|ava/i.test(v.name)) ||
        all.find((v) => v.lang === "en-US") ||
        all.find((v) => v.lang.startsWith("en")) ||
        all[0] || null;
    };
    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const cleanSpeech = useCallback((text) => {
    if (!text) return "";
    let cleaned = String(text);
    cleaned = cleaned.replace(/```[\s\S]*?```/g, " ");
    cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    cleaned = cleaned.replace(/^#+\s+/gm, "");
    cleaned = cleaned.replace(/^[-*+>]\s+/gm, "");
    cleaned = cleaned.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1");
    cleaned = cleaned.replace(/https?:\/\/\S+/g, "");
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
    return cleaned.replace(/\s+/g, " ").trim();
  }, []);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleaned = cleanSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    if (preferredVoiceRef.current) utterance.voice = preferredVoiceRef.current;
    utterance.rate = 1.05;
    utterance.pitch = 1.02;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [cleanSpeech, voiceEnabled]);

  const activeStation = useMemo(
    () => stations.find((item) => item.id === activeStationId) ?? null,
    [activeStationId, stations],
  );
  const visibleInteraction = activeStation?.renderActorInteraction === false ? null : activeStation;

  const userPose = useMemo(() => {
    if (!selectedPoseKey || !beepsPoseRegistry[selectedPoseKey] || activeStationId || moving || modelPoseState) {
      return null;
    }
    const def = beepsPoseRegistry[selectedPoseKey];
    return {
      id: `custom-pose-${def.id}`,
      kind: def.kind ?? "ambient",
      label: def.label,
      pose: {
        primary: `/assets/${def.primary}`,
        alternate: def.alternate ? `/assets/${def.alternate}` : null,
        animate: Boolean(def.alternate),
        scale: def.scale ?? 1,
        groundRatio: def.groundRatio ?? 0.02,
      },
      heldProp: null,
      message: def.message,
    };
  }, [selectedPoseKey, activeStationId, moving, modelPoseState]);

  const activeModelPose = useMemo(() => {
    if (!modelPoseState || !beepsModelPoses[modelPoseState] || moving) return null;
    const def = beepsModelPoses[modelPoseState];
    return {
      id: `model-pose-${modelPoseState}`,
      kind: "ambient",
      motionState: def.motionState,
      pose: {
        primary: `/assets/${def.primary}`,
        alternate: def.alternate ? `/assets/${def.alternate}` : null,
        animate: Boolean(def.alternate),
        scale: 1,
        groundRatio: 0.02,
      },
    };
  }, [modelPoseState, moving]);

  const effectiveInteraction = activeModelPose ?? visibleInteraction ?? userPose;
  const shouldRenderActor = roomData.stage?.renderActor !== false;
  const sessionNotesAvailable = roomId === "work";
  const displayState = modelPoseState
    ? beepsModelPoses[modelPoseState]?.motionState ?? (commandPending ? "searching" : roomData.state)
    : (commandPending ? "searching" : roomData.state);
  const groundRatio = moving
    ? walkGroundRatios[facing] ?? walkGroundRatios.front
    : effectiveInteraction?.pose?.groundRatio ?? ambientGroundRatios[displayState] ?? ambientGroundRatios.idle;

  useEffect(
    () => () => {
      window.clearTimeout(movementTimer.current);
      window.clearTimeout(bubbleTimer.current);
      window.clearTimeout(wanderTimer.current);
      window.clearTimeout(modelPoseTimer.current);
    },
    [],
  );

  useEffect(() => {
    window.clearTimeout(movementTimer.current);
    window.clearTimeout(wanderTimer.current);
    const resetTimer = window.setTimeout(() => {
      setMoving(false);
      setFacing("front");
      setActiveStationId("");
      setSelectedPoseKey(null);
      setModelPoseState(null);
      setActorPosition({ x: home.x, floor: home.floor });
      setNoteComposerOpen(false);
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [home.floor, home.x, roomId]);

  useEffect(() => {
    window.clearTimeout(wanderTimer.current);

    if (activeStationId || moving || commandOpen || selectedPoseKey || modelPoseState) return undefined;

    const bounds = wanderBounds[roomId] ?? wanderBounds.bridge;
    const floor = home.floor ?? 5;
    const delay = 4200 + Math.round(Math.random() * 3200);

    wanderTimer.current = window.setTimeout(() => {
      const currentX = actorPosition.x;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const distance = 10 + Math.round(Math.random() * 18);
      const nextX = Math.min(bounds.max, Math.max(bounds.min, currentX + direction * distance));

      if (nextX === currentX) return;

      const duration = Math.min(1700, Math.max(900, Math.abs(nextX - currentX) * 18));
      const destination = { x: nextX, floor };

      setMoving(true);
      setWalkDuration(duration);
      setFacing(nextX < currentX ? "left" : "right");
      setActorPosition(destination);
      movementTimer.current = window.setTimeout(() => {
        setMoving(false);
        setFacing("front");
        setActorPosition(destination);
      }, duration);
    }, delay);

    return () => window.clearTimeout(wanderTimer.current);
  }, [activeStationId, actorPosition.x, commandOpen, home.floor, modelPoseState, moving, roomId, selectedPoseKey]);

  const showBubble = useCallback((message, shouldSpeak = true) => {
    setBubble(message);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(""), 7000);
    if (shouldSpeak) speak(message);
  }, [speak]);

  const moveToStation = useCallback(
    (item, onArrive) => {
      window.clearTimeout(movementTimer.current);
      window.clearTimeout(wanderTimer.current);
      setSelectedPoseKey(null);
      const destination = {
        x: item.walkX ?? item.x,
        floor: item.walkFloor ?? item.floor,
      };
      const distance = Math.abs(destination.x - actorPosition.x);
      const duration = Math.min(1700, Math.max(650, distance * 13));

      setMoving(true);
      setWalkDuration(duration);
      setFacing(item.facing ?? (destination.x < actorPosition.x ? "left" : "right"));
      setActiveStationId("");
      setActorPosition(destination);
      showBubble(`Heading to ${item.label.toLowerCase()}.`);

      movementTimer.current = window.setTimeout(() => {
        setMoving(false);
        setActorPosition(destination);
        setFacing(item.facing ?? (item.x < actorPosition.x ? "left" : "right"));
        setActiveStationId(item.id);
        const statusMessage = item.message ?? `${item.label} is active.`;
        setMessages((current) => [
          ...current,
          {
            id: `beeps-station-${Date.now()}`,
            role: "beeps",
            text: `${item.label}: ${statusMessage}`,
          },
        ]);
        showBubble(statusMessage);
        onArrive?.();
      }, duration);
    },
    [actorPosition.x, showBubble],
  );

  useEffect(() => {
    if (!navigationRequest || navigationRequest.roomId !== roomId) return undefined;
    if (handledNavigationRef.current === navigationRequest.token) return undefined;

    const target = stations.find((item) => item.id === navigationRequest.stationId);
    if (!target) return undefined;
    const navigationTimer = window.setTimeout(() => {
      handledNavigationRef.current = navigationRequest.token;
      moveToStation(target, () => {
        if (navigationRequest.openSessionNote && roomId === "work") {
          setNoteComposerOpen(true);
        }
      });
      void onContextEvent?.({
        eventType: "navigation",
        area: roomId,
        request: navigationRequest.request,
        response: `Beeps moved to ${target.label}.`,
        modelStatus: "navigation",
      });
    }, 90);

    return () => window.clearTimeout(navigationTimer);
  }, [moveToStation, navigationRequest, onContextEvent, roomId, stations]);

  const submitCommand = async (event) => {
    event.preventDefault();
    const nextCommand = command.trim();
    if (!nextCommand) return;

    if (/\b(session note|daily note|session-note)\b/i.test(nextCommand)) {
      setCommand("");
      setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: nextCommand }]);
      if (!sessionNotesAvailable) {
        onRequestNavigation?.(nextCommand, { openSessionNote: true });
        const response = "Session notes live in the Work room. Open Work and I'll bring up the protected note workspace there.";
        setMessages((current) => [...current, { id: `beeps-${Date.now() + 1}`, role: "beeps", text: response }]);
        showBubble("Session notes live in Work.");
        return;
      }
      setNoteComposerOpen(true);
      setMessages((current) => [...current, { id: `beeps-${Date.now() + 1}`, role: "beeps", text: "Opening the protected session-note workspace. I'll use prior context, but today's observations still come from you." }]);
      void onContextEvent?.({
        eventType: "session_note_workspace",
        area: "clinical",
        request: nextCommand,
        response: "Opened the protected session-note workspace.",
        modelStatus: "not_applicable",
      });
      showBubble("Opening the session-note workspace.");
      return;
    }

    // Generate a conversationId to correlate the SSE stream with this /api/ask request.
    const conversationId = `cockpit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const streamEventLabels = {
      queued: "Request queued.",
      routed: "Routing...",
      generating: "Generating response...",
      finalizing: "Almost there...",
      done: "Let me pull the right thread.",
    };

    window.clearTimeout(modelPoseTimer.current);
    setModelPoseState("routing");
    broadcastBeepsSync("thinking", "Routing...", "Routing...");
    setCommandPending(true);
    setActiveThoughts([]);
    setPendingMessage("Routing...");
    setStreamedText("");
    setCommand("");
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text: nextCommand },
    ]);

    // Open the SSE stream before firing /api/ask so we catch all events.
    let accumulatedChunks = "";
    const closeStream = openBeepsStream(conversationId, (ev) => {
      if (ev?.type === "chunk" && typeof ev.text === "string") {
        accumulatedChunks += ev.text;
        setStreamedText(accumulatedChunks);
        setModelPoseState("speaking");
      } else if (ev?.type === "generating") {
        setModelPoseState("thinking");
        setPendingMessage(streamEventLabels[ev.type] ?? ev.label);
        broadcastBeepsSync("thinking", streamEventLabels[ev.type] ?? ev.label, ev.label);
      } else if (ev?.type === "tool") {
        setModelPoseState("thinking");
        const toolLabel = ev.label || `Working: running ${ev.name || "tool"}...`;
        setPendingMessage(toolLabel);
        broadcastBeepsSync("work", toolLabel, toolLabel);
      } else if (ev?.type === "routed" || ev?.type === "queued") {
        setModelPoseState("routing");
        setPendingMessage(streamEventLabels[ev.type] ?? ev.label);
        broadcastBeepsSync("thinking", streamEventLabels[ev.type] ?? ev.label, ev.label);
      } else if (ev?.type === "done") {
        broadcastBeepsSync("cheer", ev.label || "Response complete.", ev.summary || ev.label || "Response complete.");
      } else if (ev?.label) {
        setPendingMessage(streamEventLabels[ev.type] ?? ev.label);
      }
    });

    try {
      const conversation = messages
        .filter((message) => message.role === "user" || message.role === "beeps")
        .slice(-12)
        .map(({ role, text }) => ({ role, text }));
      let attachmentContext = "";
      if (attachments.length) {
        const files = await Promise.all(attachments.map(async (file) => ({
          name: file.name,
          type: file.type || "application/octet-stream",
          contentBase64: await readFileAsBase64(file),
        })));
        const extracted = await extractBeepsAttachments(files);
        attachmentContext = String(extracted.text || extracted.context || "").slice(0, 12000);
      }
      const rawResult = await Promise.resolve(
        onCommand?.(nextCommand, {
          room,
          roomId,
          conversation,
          sourceMode: "brain",
          groundingScope: roomId === "work" ? "work" : "conversation",
          attachmentContext,
          conversationId,
        }) ?? "I'm here. Tell me what you're working on.",
      );

      let reply = typeof rawResult === "string" ? rawResult : (rawResult?.answer || rawResult?.text || "");
      let thoughts = Array.isArray(rawResult?.thoughts) ? rawResult.thoughts : [];

      setMessages((current) => [
        ...current,
        { id: `beeps-${Date.now()}`, role: "beeps", text: reply, thoughts },
      ]);
      void onContextEvent?.({
        eventType: "interaction",
        area: roomId,
        request: nextCommand,
        response: reply,
        modelStatus: "chat",
      });
      showBubble(reply);

      // Model success cheer
      setModelPoseState("success");
      broadcastBeepsSync("cheer", "Response complete.", reply?.slice(0, 100));
      modelPoseTimer.current = window.setTimeout(() => {
        setModelPoseState(null);
        broadcastBeepsSync("idle", "Idle.");
      }, 3200);
    } catch (err) {
      setModelPoseState("error");
      broadcastBeepsSync("idle", "Error occurred.");
      modelPoseTimer.current = window.setTimeout(() => {
        setModelPoseState(null);
      }, 3000);
      throw err;
    } finally {
      closeStream();
      setAttachments([]);
      setCommandPending(false);
      setStreamedText("");
      setActiveThoughts([]);
      setPendingMessage("Let me pull the right thread.");
    }
  };

  const setPrompt = (prompt) => {
    setCommand(prompt);
    setChatOpen(true);
    setCommandOpen(true);
  };

  return (
    <aside
      className="beeps-station"
      data-chat-open={chatOpen}
      data-room={roomId}
      style={{
        "--beeps-room-accent": roomData.accent,
        "--beeps-room-scale": roomData.stage?.actorScale ?? 1,
      }}
    >
      <div className="beeps-stage" aria-label={`${room} interactive floor`}>
        <div className="beeps-prop-visual-map" aria-hidden="true">
          {stations.map((item) => {
            const isActive = item.id === activeStationId;
            const displayAsset = isActive && item.usedAsset ? item.usedAsset : item.asset;
            const isHiddenForActivePose =
              (!isActive && activeStation?.hidesStations?.includes(item.id)) ||
              (isActive && item.hidePropOnActive);

            if (
              isHiddenForActivePose ||
              (!displayAsset && !item.screen) ||
              (item.renderAsset === false && !(isActive && (item.usedAsset || item.screen)))
            ) return null;

            return (
              <div
                className="beeps-prop-visual"
                data-active={isActive}
                data-asset={item.kind}
                data-composition={item.composition}
                data-remove-on-use={item.removeOnUse ? "true" : "false"}
                data-station={item.id}
                data-stock-state={isActive && (item.usedAsset || item.removeOnUse) ? "item-removed" : "stocked"}
                key={item.id}
                style={{
                  "--prop-x": `${item.x}%`,
                  "--prop-floor": `${item.floor}%`,
                  "--prop-width": item.visualSize?.width ? `${item.visualSize.width}px` : undefined,
                  "--prop-height": item.visualSize?.height ? `${item.visualSize.height}px` : undefined,
                  zIndex: Math.min(item.layer ?? 4, 5),
                }}
                >
                  {displayAsset && <img src={displayAsset} alt="" draggable="false" />}
                  {item.screen && <span className={`beeps-screen-glow beeps-screen-glow--${item.screen}`} />}
                </div>
            );
          })}
        </div>

        <div className="beeps-station-map" aria-label="Room interactables">
          {stations.map((item) => {
            const isActive = item.id === activeStationId;

            return (
              <button
                className="beeps-prop-button"
                data-active={isActive}
                data-asset={item.kind}
                data-composition={item.composition}
                data-label={item.label}
                data-remove-on-use={item.removeOnUse ? "true" : "false"}
                data-station={item.id}
                data-stock-state={isActive && (item.usedAsset || item.removeOnUse) ? "item-removed" : "stocked"}
                key={item.id}
                type="button"
                aria-label={`${item.label}. Send Beeps here.`}
                aria-pressed={isActive}
                style={{
                  "--prop-x": `${item.x}%`,
                  "--prop-floor": `${item.floor}%`,
                  "--prop-width": item.visualSize?.width ? `${item.visualSize.width}px` : undefined,
                  "--prop-height": item.visualSize?.height ? `${item.visualSize.height}px` : undefined,
                  "--hit-width": item.hitSize?.width ? `${item.hitSize.width}px` : undefined,
                  "--hit-height": item.hitSize?.height ? `${item.hitSize.height}px` : undefined,
                  zIndex: item.layer ?? 4,
                }}
                onClick={() => moveToStation(item)}
              />
            );
          })}
        </div>

        {shouldRenderActor && <div
          className="beeps-actor"
          data-interacting={Boolean(visibleInteraction) && !moving}
          data-moving={moving}
          data-speaking={isSpeaking}
          style={{
            "--beeps-x": `${actorPosition.x}%`,
            "--beeps-floor": `${actorPosition.floor}%`,
            "--beeps-walk-ms": `${walkDuration}ms`,
            "--beeps-ground-ratio": groundRatio,
          }}
        >
          {bubble && (
            <div className="beeps-speech-bubble" aria-hidden="true">
              <span>{bubble}</span>
            </div>
          )}
          <button
            className="beeps-sprite-button"
            type="button"
            aria-label="Talk to Beeps"
            aria-expanded={chatOpen && commandOpen}
            onClick={() => {
              setChatOpen(true);
              setCommandOpen((open) => !open);
            }}
          >
            <BeepsMotion
              roomId={roomId}
              state={displayState}
              ambientSrc={roomData.ambientAsset ? `/assets/${roomData.ambientAsset}` : (stateAssets[roomData.state] ?? stateAssets.idle)}
              ambientAlternateSrc={roomData.ambientAlternateAsset ? `/assets/${roomData.ambientAlternateAsset}` : null}
              interaction={effectiveInteraction}
              moving={moving}
              facing={facing}
              isSpeaking={isSpeaking}
            />
          </button>
        </div>}
      </div>

      {!chatOpen && (
        <button
          className="beeps-chat-reopen"
          type="button"
          aria-label="Open Beeps chat"
          onClick={() => {
            setChatOpen(true);
            setCommandOpen(true);
          }}
        >
          Chat
        </button>
      )}

      {chatOpen && <div className="beeps-readout">
        <section className="beeps-chat" aria-label="Chat with Beeps">
          <header className="beeps-chat-header">
            <div>
              <span className="beeps-chat-kicker">Beeps / live channel</span>
              <strong>Talk to Beeps</strong>
            </div>
            <div className="beeps-chat-header-actions">
              <button
                className="beeps-voice-toggle"
                type="button"
                aria-pressed={voiceEnabled}
                onClick={() => setVoiceEnabled((v) => !v)}
                title="Toggle Beeps voice output"
              >
                VOICE: {voiceEnabled ? "ON" : "OFF"}
              </button>
              <button
                className="beeps-chat-toggle"
                type="button"
                aria-expanded={chatOpen}
                onClick={() => setChatOpen(false)}
              >
                Close
              </button>
            </div>
          </header>

          <div className="beeps-room-actions" aria-label="Room stations">
            <span>Room stations</span>
            <div>
              {stations.map((item) => (
                <button
                  aria-label={`Go to ${item.label}`}
                  aria-pressed={item.id === activeStationId}
                  key={item.id}
                  type="button"
                  onClick={() => moveToStation(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="beeps-room-actions beeps-pose-actions" aria-label="Beeps Poses">
            <span>Beeps pose</span>
            <div>
              <button
                type="button"
                aria-pressed={!selectedPoseKey && !activeStationId}
                onClick={() => {
                  setSelectedPoseKey(null);
                  setActiveStationId("");
                  showBubble("Standing by on the bridge.");
                }}
              >
                Auto / Stand
              </button>
              {Object.entries(beepsPoseRegistry).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selectedPoseKey === key}
                  onClick={() => {
                    setActiveStationId("");
                    setSelectedPoseKey(key);
                    showBubble(item.message);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="beeps-chat-history" aria-live="polite">
            {messages.map((message) => (
              <div className={`beeps-chat-message beeps-chat-message--${message.role}`} key={message.id}>
                <span>{message.role === "user" ? "You" : "Beeps"}</span>
                {Array.isArray(message.thoughts) && message.thoughts.length > 0 && (
                  <details className="beeps-thoughts-container">
                    <summary className="beeps-thoughts-summary">
                      <span className="beeps-thoughts-pulse" />
                      Thought Process ({message.thoughts.length})
                    </summary>
                    <div className="beeps-thoughts-content">
                      {message.thoughts.map((thought, idx) => (
                        <p key={idx} className="beeps-thought-item">{thought}</p>
                      ))}
                    </div>
                  </details>
                )}
                <p>{message.text}</p>
                {message.role === "beeps" && <button
                  className="beeps-message-copy"
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(message.text)}
                >
                  Copy
                </button>}
              </div>
            ))}
            {commandPending && (
              <div className="beeps-chat-message beeps-chat-message--beeps beeps-chat-message--pending">
                <span>Beeps</span>
                {streamedText ? (
                  <div className="beeps-streamed-preview">
                    <p style={{ whiteSpace: "pre-wrap" }}>{streamedText}</p>
                  </div>
                ) : (
                  <div className="beeps-pending-indicator">
                    <span className="beeps-thinking-dot" />
                    <span className="beeps-thinking-dot" />
                    <span className="beeps-thinking-dot" />
                    <span className="beeps-pending-text">{pendingMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {!commandOpen && (
            <div className="beeps-chat-prompts" aria-label="Suggested questions">
              <button type="button" onClick={() => setPrompt("What is current?")}>What is current?</button>
              <button type="button" onClick={() => setPrompt("Where is the Game Hub?")}>Find a project</button>
              <button type="button" onClick={() => setPrompt("What can you do?")}>What can you do?</button>
              {sessionNotesAvailable && <button type="button" onClick={() => setNoteComposerOpen(true)}>Build session note</button>}
            </div>
          )}

          {noteComposerOpen && sessionNotesAvailable && (
            <SessionNoteComposer
              pending={notePending}
              onClose={() => setNoteComposerOpen(false)}
              onDraft={async (input) => {
                setNotePending(true);
                try {
                  return await onSessionNoteDraft?.(input);
                } finally {
                  setNotePending(false);
                }
              }}
            />
          )}

          {commandOpen && (
            <form className="beeps-command-console" onSubmit={submitCommand}>
              <label htmlFor={`beeps-command-${roomId}`}>Message Beeps</label>
              {sessionNotesAvailable && <button
                className="beeps-note-launch"
                type="button"
                aria-expanded={noteComposerOpen}
                onClick={() => setNoteComposerOpen((open) => !open)}
              >
                {noteComposerOpen ? "Close note workspace" : "Build session note / upload data"}
              </button>}
              <div className="beeps-command-row">
                <input
                  ref={attachmentInputRef}
                  className="beeps-attachment-input"
                  type="file"
                  multiple
                  onChange={(event) => setAttachments(Array.from(event.target.files || []))}
                />
                <button
                  className="beeps-attach-button"
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  disabled={commandPending}
                >
                  Attach
                </button>
                <textarea
                  id={`beeps-command-${roomId}`}
                  rows={1}
                  value={command}
                  onChange={(event) => {
                    setCommand(event.target.value);
                    event.target.style.height = "auto";
                    event.target.style.height = `${Math.min(event.target.scrollHeight, 140)}px`;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submitCommand(event);
                    }
                  }}
                  placeholder="Ask about a project, source, or next step (Shift+Enter for newline)"
                  autoFocus
                  disabled={commandPending}
                />
                <button type="submit" disabled={commandPending || !command.trim()}>Send</button>
              </div>
              {attachments.length > 0 && <div className="beeps-attachment-tray" aria-live="polite">
                {attachments.map((file) => <span className="beeps-attachment-chip" key={`${file.name}-${file.size}`}>
                  {file.name}
                  <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((current) => current.filter((item) => item !== file))}>x</button>
                </span>)}
              </div>}
            </form>
          )}

        {bubble && <span className="beeps-sr-only">{bubble}</span>}
        </section>
      </div>}
    </aside>
  );
}
