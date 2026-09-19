import "./BeepsMotion.css";

const roomLabels = {
  bridge: "Command Deck",
  "bee-brain": "Memory Core",
  "creative-lab": "Creative Lab",
  work: "Operations Engine",
  school: "Learning Observatory",
};

const walkFrames = {
  front: [
    "/assets/beeps-walk-left-a-v2.png",
    "/assets/beeps-walk-left-b-v2.png",
    "/assets/beeps-walk-right-a-v2.png",
    "/assets/beeps-walk-right-b-v2.png",
  ],
  left: [
    "/assets/beeps-walk-left-a-v2.png",
    "/assets/beeps-walk-left-b-v2.png",
    "/assets/beeps-walk-left-a-v2.png",
    "/assets/beeps-walk-left-b-v2.png",
  ],
  right: [
    "/assets/beeps-walk-right-a-v2.png",
    "/assets/beeps-walk-right-b-v2.png",
    "/assets/beeps-walk-right-a-v2.png",
    "/assets/beeps-walk-right-b-v2.png",
  ],
  back: [
    "/assets/beeps-facing-back.png",
    "/assets/beeps-facing-back.png",
    "/assets/beeps-facing-back.png",
    "/assets/beeps-facing-back.png",
  ],
};

export default function BeepsMotion({
  roomId = "bridge",
  label = "Beeps",
  state = "idle",
  ambientSrc = "/assets/beeps-state-idle.png",
  ambientAlternateSrc = null,
  interaction = null,
  moving = false,
  facing = "front",
  isSpeaking = false,
}) {
  const roomLabel = roomLabels[roomId] ?? roomId;
  const frames = walkFrames[facing] ?? walkFrames.front;
  const hasInteractionAnimation = Boolean(interaction?.pose?.alternate && interaction?.pose?.animate);
  const mode = moving ? "walk" : interaction ? "interaction" : "ambient";

  return (
    <span
      className="beeps-motion"
      data-facing={facing}
      data-action={interaction?.kind ?? "ambient"}
      data-held={interaction?.heldProp ? "true" : "false"}
      data-held-kind={interaction?.heldPropKind ?? interaction?.kind ?? "none"}
      data-interaction-alt={hasInteractionAnimation ? "true" : "false"}
      data-mode={mode}
      data-walk-style={facing === "front" ? "stride" : "directional"}
      data-seat={interaction?.kind === "chair" || interaction?.kind === "beanbag" ? "true" : "false"}
      data-state={interaction?.motionState ?? state}
      data-speaking={isSpeaking ? "true" : "false"}
      style={{ "--beeps-pose-scale": interaction?.pose?.scale ?? 1 }}
      role="img"
      aria-label={`${label}, ${roomLabel}`}
    >
      <span className="beeps-presence-field" aria-hidden="true" />
      <span className="beeps-presence-beacon" aria-hidden="true" />

      <img className="beeps-frame beeps-frame--ambient" src={ambientSrc} alt="" draggable="false" />
      {ambientAlternateSrc && <img className="beeps-frame beeps-frame--ambient beeps-frame--ambient-alt" src={ambientAlternateSrc} alt="" draggable="false" />}
      <img className="beeps-frame beeps-frame--walk beeps-frame--walk-a" src={frames[0]} alt="" draggable="false" />
      <img className="beeps-frame beeps-frame--walk beeps-frame--walk-c" src={frames[1]} alt="" draggable="false" />
      <img className="beeps-frame beeps-frame--walk beeps-frame--walk-b" src={frames[2]} alt="" draggable="false" />
      <img className="beeps-frame beeps-frame--walk beeps-frame--walk-d" src={frames[3]} alt="" draggable="false" />

      {interaction && (
        <>
          <img className="beeps-frame beeps-frame--interaction" src={interaction.pose.primary} alt="" draggable="false" />
          {hasInteractionAnimation && (
            <img className="beeps-frame beeps-frame--interaction beeps-frame--interaction-alt" src={interaction.pose.alternate} alt="" draggable="false" />
          )}
          {interaction.heldProp && (
            <img className="beeps-held-prop" src={interaction.heldProp} alt="" draggable="false" />
          )}
        </>
      )}

      <span className="beeps-effect beeps-effect--success" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="beeps-effect beeps-effect--error" aria-hidden="true">!</span>
      <span className="beeps-effect beeps-effect--serious" aria-hidden="true" />
      <span className="beeps-effect beeps-effect--searching" aria-hidden="true" />
      <span className="beeps-effect beeps-effect--thinking" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
