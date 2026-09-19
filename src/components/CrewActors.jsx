import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./CrewActors.css";
import beepsSDK from "../sdk/BeepsSDK";

import { CREW_CONFIG } from "../data/crewConfig";

function CrewMember({ config, isWorking, status = "idle", statusDetail = "" }) {
  const [x, setX] = useState(config.initialX);
  const [facing, setFacing] = useState(config.initialFacing);
  const [mode, setMode] = useState("idle"); // "idle" | "walk" | "cheer" | "work" | "complete" | "error"
  const [walkDuration, setWalkDuration] = useState(1400);
  const [bubbleText, setBubbleText] = useState("");
  const wanderTimer = useRef(null);
  const walkTimer = useRef(null);
  const bubbleTimer = useRef(null);
  const statusTimer = useRef(null);

  // Compute active status taking either boolean isWorking or string status
  const currentStatus = (typeof status === "object" ? status.mode : status) || (isWorking ? "work" : "idle");
  const currentDetail = (typeof status === "object" ? status.detail : statusDetail) || "";

  useEffect(() => {
    window.clearTimeout(statusTimer.current);
    if (currentStatus === "work") {
      window.clearTimeout(wanderTimer.current);
      window.clearTimeout(walkTimer.current);
      window.clearTimeout(bubbleTimer.current);
      setBubbleText(currentDetail ? `⚡ ${currentDetail}` : "");
      setMode("work");
    } else if (currentStatus === "complete") {
      window.clearTimeout(wanderTimer.current);
      window.clearTimeout(walkTimer.current);
      setMode("complete");
      if (currentDetail) {
        setBubbleText(`✨ ${currentDetail}`);
        bubbleTimer.current = window.setTimeout(() => setBubbleText(""), 4000);
      }
      statusTimer.current = window.setTimeout(() => {
        setMode("idle");
      }, 3500);
    } else if (currentStatus === "error") {
      window.clearTimeout(wanderTimer.current);
      window.clearTimeout(walkTimer.current);
      setMode("error");
      setBubbleText(currentDetail ? `⚠️ ${currentDetail}` : "Alert: anomaly detected!");
      bubbleTimer.current = window.setTimeout(() => setBubbleText(""), 4500);
      statusTimer.current = window.setTimeout(() => {
        setMode("idle");
      }, 4000);
    } else {
      setMode((prevMode) => (prevMode === "work" ? "idle" : prevMode));
    }
    return () => {
      window.clearTimeout(statusTimer.current);
    };
  }, [currentStatus, currentDetail]);


  // Autonomous wandering patrol cycle within dedicated bounds
  useEffect(() => {
    window.clearTimeout(wanderTimer.current);

    if (mode === "cheer") return undefined;

    const delay = 4200 + Math.floor(Math.random() * 4500);

    wanderTimer.current = window.setTimeout(() => {
      // 75% chance to roam, 25% chance to pause/idle
      if (Math.random() < 0.75) {
        const { min, max } = config.bounds;
        const currentX = x;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const delta = 4 + Math.random() * 8;
        let nextX = currentX + direction * delta;

        // Bounce back if out of bounds
        if (nextX < min) nextX = min + Math.random() * 3;
        if (nextX > max) nextX = max - Math.random() * 3;

        const distance = Math.abs(nextX - currentX);
        if (distance > 1.5) {
          const duration = Math.min(2200, Math.max(1000, Math.round(distance * 140)));
          const nextFacing = nextX < currentX ? "left" : "right";

          setFacing(nextFacing);
          setMode("walk");
          setWalkDuration(duration);
          setX(nextX);

          walkTimer.current = window.setTimeout(() => {
            setMode("idle");
          }, duration);
        }
      }
    }, delay);

    return () => {
      window.clearTimeout(wanderTimer.current);
    };
  }, [config.bounds, mode, x]);

  // Click handler: trigger cheer and pop a lively speech bubble
  const handleClick = useCallback(() => {
    window.clearTimeout(walkTimer.current);
    window.clearTimeout(wanderTimer.current);
    window.clearTimeout(bubbleTimer.current);
    window.clearTimeout(workTimer.current);

    setMode("cheer");

    // Select random dialogue line
    const line = config.dialogues[Math.floor(Math.random() * config.dialogues.length)];
    setBubbleText(line);

    // Auto-dismiss bubble and reset to idle
    bubbleTimer.current = window.setTimeout(() => {
      setBubbleText("");
    }, 4500);

    window.setTimeout(() => {
      setMode("idle");
    }, 2800);
  }, [config.dialogues]);







  const framesList = useMemo(() => {
    const list = [];
    const f = config.frames;
    if (typeof f.idle === 'string') list.push({ id: 'idle-a', src: f.idle });
    else if (Array.isArray(f.idle)) f.idle.forEach((s, i) => list.push({ id: `idle-${['a','b'][i] || i}`, src: s }));

    if (Array.isArray(f.walkL)) f.walkL.forEach((s, i) => list.push({ id: `walk-l-${['a','b','c','d'][i]||i}`, src: s }));
    if (Array.isArray(f.walkR)) f.walkR.forEach((s, i) => list.push({ id: `walk-r-${['a','b','c','d'][i]||i}`, src: s }));
    if (Array.isArray(f.cheer)) f.cheer.forEach((s, i) => list.push({ id: `cheer-${['a','b'][i]||i}`, src: s }));
    if (Array.isArray(f.complete)) f.complete.forEach((s, i) => list.push({ id: `complete-${['a','b'][i]||i}`, src: s }));
    if (Array.isArray(f.work)) f.work.forEach((s, i) => list.push({ id: `work-${['a','b'][i]||i}`, src: s }));
    if (Array.isArray(f.thinking)) f.thinking.forEach((s, i) => list.push({ id: `thinking-${['a','b'][i]||i}`, src: s }));
    if (Array.isArray(f.error)) f.error.forEach((s, i) => list.push({ id: `error-${['a','b'][i]||i}`, src: s }));
    
    return list;
  }, [config.frames]);

  const actorStyle = {
    "--crew-accent": config.accent,
    "--crew-glow": config.glow,
    "--walk-duration": `${walkDuration}ms`,
    left: `${x}%`,
    [config.yAnchor]: config.yOffset,
  };

  return (
    <div
      className={`crew-actor-unit crew-actor-unit--${config.id}`}
      style={actorStyle}
      data-mode={mode}
      data-facing={facing}
    >
      {/* Speech Bubble */}
      {bubbleText && (
        <div className="crew-speech-bubble" role="status" aria-live="polite">
          <div className="crew-speech-badge">
            <span className="crew-speech-name">{config.name}</span>
            <span className="crew-speech-role">{config.role}</span>
          </div>
          <p className="crew-speech-text">{bubbleText}</p>
          <div className="crew-speech-caret" aria-hidden="true" />
        </div>
      )}

      {/* Interactive Actor Button */}
      <button
        type="button"
        className="crew-actor-btn"
        onClick={handleClick}
        title={`${config.name} // ${config.title} (Click to interact)`}
        aria-label={`${config.name} ${config.role} actor`}
      >
        <div className="crew-actor-halo" aria-hidden="true" />
        {framesList.map(frame => (
          <img
            key={frame.id}
            src={frame.src}
            alt={`${config.name} ${frame.id}`}
            className={`crew-actor-sprite crew-actor-sprite--${config.id}`}
            data-frame-id={frame.id}
            draggable="false"
          />
        ))}
        <div className="crew-actor-badge">
          <span className="crew-badge-name">{config.name}</span>
          <span className="crew-badge-role">{config.role}</span>
        </div>
      </button>
    </div>
  );
}

export default function CrewActors() {
  const [crewStatus, setCrewStatus] = useState({
    alloy: { mode: "idle", detail: "" },
    nebula: { mode: "idle", detail: "" },
    doublestuffiana: { mode: "idle", detail: "" },
    rivet: { mode: "idle", detail: "" },
    beeps: { mode: "idle", detail: "" },
  });

  // TELEMETRY: Observes crew dispatch events from BeepsSDK
  useEffect(() => {
    const handleStatusDispatch = (payload) => {
      const { crew_member, task } = payload;
      let memberKey = (crew_member || "").toLowerCase().trim();
      if (memberKey === "nebula" || memberKey === "nebs") memberKey = "nebula";
      if (memberKey === "oreo" || memberKey === "doublestuffiana" || memberKey === "doublestuff") memberKey = "doublestuffiana";

      setCrewStatus(prev => {
        if (memberKey in prev) {
          let nextMode = "idle";
          if (task === "start" || task === "working") nextMode = "work";
          else if (task === "complete" || task === "success" || task === "done" || task === "cheer") nextMode = "complete";
          else if (task === "error" || task === "failed") nextMode = "error";
          return {
            ...prev,
            [memberKey]: { mode: nextMode, detail: payload.task_detail || payload.detail || "" }
          };
        }
        return prev;
      });
    };

    const unsubscribe = beepsSDK.observe('crew-dispatch', handleStatusDispatch);

    // Initial ambient demonstrations
    setTimeout(() => {
      beepsSDK.dispatch('crew-dispatch', { crew_member: 'alloy', task: 'start', task_detail: 'Running deep-space diagnostic scan.' });
    }, 3000);
    
    setTimeout(() => {
      beepsSDK.dispatch('crew-dispatch', { crew_member: 'alloy', task: 'complete', task_detail: 'Diagnostic scan complete. All systems nominal.' });
    }, 8000);

    return unsubscribe;
  }, []);

  return (
    <div className="crew-actors-layer" aria-label="Active Crew Stations">
      <CrewMember config={CREW_CONFIG.alloy} status={crewStatus.alloy} />
      <CrewMember config={CREW_CONFIG.nebula} status={crewStatus.nebula} />
      <CrewMember config={CREW_CONFIG.doublestuffiana} status={crewStatus.doublestuffiana} />
      <CrewMember config={CREW_CONFIG.rivet} status={crewStatus.rivet} />
      <CrewMember config={CREW_CONFIG.beeps} status={crewStatus.beeps} />
    </div>
  );
}
