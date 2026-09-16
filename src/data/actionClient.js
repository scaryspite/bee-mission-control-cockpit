import { appLinks } from "./appLinks";

export async function previewBeepsAction(request, action) {
  const response = await fetch(`${appLinks.navigator.apiUrl.replace(/\/$/, "")}/api/action/preview`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ request, action }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Beeps action preview is unavailable.");
  return payload;
}

export async function applyBeepsAction(request, action) {
  const response = await fetch(`${appLinks.navigator.apiUrl.replace(/\/$/, "")}/api/action/apply`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ request, action, approved: true }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Beeps could not apply the action.");
  return payload;
}

export function formatAppliedAction(result) {
  const route = result.materialRoute;
  const generated = result.generatedMaterial?.draftContent;
  const proposal = result.generatedMaterial?.gameUpdateProposal || result.gameUpdateProposal;
  const structured = proposal?.proposedGameFields;
  return [
    `Created a review draft at ${result.outputPath}.`,
    route ? `Route: ${route.client || "Needs confirmation"} / ${route.game || "Needs confirmation"}.` : null,
    generated ? `\nGenerated material:\n${generated}` : "The model did not produce draft content; review the confirmation items.",
    proposal ? `\nGame Hub proposal: ${proposal.client} / ${proposal.game}\nChild file: ${proposal.sourceFile}\nData shape: ${proposal.dataPath}\nFormat: ${proposal.format || "Needs confirmation"}\nPlacement: ${proposal.placement?.value || "Needs confirmation"}\nReady for child update: ${proposal.readyForChildUpdate ? "Yes" : "No"}${structured ? `\nStructured fields:\n${JSON.stringify(structured, null, 2)}` : "\nStructured fields: unavailable until a valid model payload is generated."}\nThe independent Game Hub app was not changed.` : null,
    "\nIt is not canonical, published, or deployed."
  ].filter(Boolean).join("\n");
}

export function formatActionPreview(preview) {
  const sourcePaths = [...new Set([
    ...preview.sources.map((source) => source.path),
    ...(preview.generatedMaterial?.sourcePaths || [])
  ])];
  const sourceText = sourcePaths.length
    ? sourcePaths.map((source) => `- ${source}`).join("\n")
    : "- None retrieved";
  const route = preview.materialRoute;
  const generated = preview.generatedMaterial?.draftContent;
  const proposal = preview.generatedMaterial?.gameUpdateProposal || preview.gameUpdateProposal;
  const generationError = preview.generatedMaterial?.generationError;
  return [
    "Action preview ready.",
    `Target: ${preview.target}`,
    `Request: ${preview.request}`,
    ...(route ? [
      `Route: ${route.client || "Needs confirmation"} / ${route.game || "Needs confirmation"}`,
      `Materials home: ${route.materialHome || "Needs confirmation"}`,
      `Game Hub route: ${route.gameRoute || "Needs confirmation"}`
    ] : []),
    "Sources checked:",
    sourceText,
    ...(proposal ? [
      "",
      "Game Hub update proposal:",
      `- Child app: ${proposal.childApplication}`,
      `- File: ${proposal.sourceFile}`,
      `- Data shape: ${proposal.dataPath}`,
      `- Fields: ${proposal.schemaFields.join(", ")}`,
      `- Format: ${proposal.format || "Needs confirmation"}`,
      `- Placement: ${proposal.placement?.value || "Needs confirmation"}${proposal.placement?.label ? ` (${proposal.placement.label})` : ""}`,
      `- Ready for child update: ${proposal.readyForChildUpdate ? "Yes" : "No"}`,
      `- Review note: ${proposal.reviewNote}`,
      "- Applied: No",
      ...(proposal.proposedGameFields ? [
        "- Structured fields:",
        JSON.stringify(proposal.proposedGameFields, null, 2)
      ] : ["- Structured fields: unavailable until a valid model payload is generated."])
    ] : []),
    ...(generated ? ["", "Generated draft:", generated] : ["", `Generated draft unavailable${generationError ? `: ${generationError}` : "."}`]),
    `Next: ${preview.nextStep}`,
    "Needs confirmation:",
    preview.needsConfirmation.map((item) => `- ${item}`).join("\n")
  ].join("\n");
}
