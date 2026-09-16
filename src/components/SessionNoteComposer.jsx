import { useState } from "react";
import { formatDateForInput } from "../data/dateUtils";

function copyText(value, onCopied) {
  if (!navigator.clipboard?.writeText) return;
  navigator.clipboard.writeText(value).then(onCopied).catch(() => {});
}

async function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export default function SessionNoteComposer({ onDraft, onClose, pending = false }) {
  const [client, setClient] = useState("BeGo");
  const [sessionDate, setSessionDate] = useState(formatDateForInput(new Date()));
  const [currentObservations, setCurrentObservations] = useState("");
  const [dataSheetNames, setDataSheetNames] = useState([]);
  const [dataSheetFiles, setDataSheetFiles] = useState([]);
  const [dataSheetMessage, setDataSheetMessage] = useState("");
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadDataSheets = async (event) => {
    const files = Array.from(event.target.files || []);
    setDataSheetNames(files.map((file) => file.name));
    if (!files.length) {
      setDataSheetFiles([]);
      setDataSheetMessage("");
      return;
    }
    const readableFiles = files.filter((file) => /\.(csv|tsv|txt|md|json)$/i.test(file.name) || /^(text\/|application\/json)/.test(file.type));
    const binaryFiles = files.filter((file) => !readableFiles.includes(file));
    if (readableFiles.length) {
      const text = (await Promise.all(readableFiles.map(async (file) => `SOURCE SHEET: ${file.name}\n${await file.text()}`))).join("\n\n");
      setCurrentObservations((current) => current.trim() ? `${current.trim()}\n\n${text}` : text);
    }
    const encodedFiles = await Promise.all(binaryFiles.map(async (file) => ({
      name: file.name,
      mimeType: file.type,
      base64: await arrayBufferToBase64(await file.arrayBuffer())
    })));
    setDataSheetFiles(encodedFiles);
    const messages = [];
    if (readableFiles.length) messages.push(`${readableFiles.length} readable sheet${readableFiles.length === 1 ? "" : "s"} loaded into the draft input`);
    if (binaryFiles.length) messages.push(`${binaryFiles.length} PDF/spreadsheet file${binaryFiles.length === 1 ? "" : "s"} attached for transient local extraction`);
    setDataSheetMessage(`${messages.join("; ")}. Originals are not moved or saved by Beeps.`);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const nextDraft = await onDraft({ client, sessionDate, currentObservations, dataSheetNames, dataSheets: dataSheetFiles });
      setDraft(nextDraft);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Beeps could not prepare the note draft.");
    }
  };

  return (
    <section className="beeps-note-composer" aria-label="Session note draft">
      <header className="beeps-note-composer-header">
        <div>
          <span className="beeps-chat-kicker">Protected work tool</span>
          <strong>Build session note</strong>
        </div>
        <div className="beeps-note-composer-actions">
          <span className="beeps-note-status">Draft only</span>
          <button type="button" onClick={onClose} disabled={pending}>Close</button>
        </div>
      </header>

      <form className="beeps-note-form" onSubmit={submit}>
        <div className="beeps-note-form-grid">
          <label>
            Client system
            <select value={client} onChange={(event) => setClient(event.target.value)} disabled={pending}>
              <option>BeGo</option>
              <option>MiLy</option>
            </select>
          </label>
          <label>
            Session date
            <input type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} disabled={pending} />
          </label>
        </div>

        <label>
          Session narrative or readable data-sheet text
          <textarea
            value={currentObservations}
            onChange={(event) => setCurrentObservations(event.target.value)}
            placeholder="Give Beeps the narrative. She will shape it into the copy boxes without inventing missing facts."
            rows={5}
            disabled={pending}
          />
        </label>

        <label>
          Upload data sheets (optional)
          <input type="file" accept=".csv,.tsv,.txt,.md,.json,.pdf,.xlsx,.xls" multiple onChange={loadDataSheets} disabled={pending} />
          <small className="beeps-note-file-help">Readable text sheets fill the narrative automatically. PDF/XLSX files are sent only to the protected local Brain service for transient extraction and are not saved.</small>
        </label>
        {dataSheetNames.length > 0 && <p className="beeps-note-file-status" role="status">Selected: {dataSheetNames.join(", ")}</p>}
        {dataSheetMessage && <p className="beeps-note-file-help">{dataSheetMessage}</p>}

        <button className="beeps-note-submit" type="submit" disabled={pending || (!currentObservations.trim() && !dataSheetFiles.length)}>
          {pending ? "Drafting..." : "Generate copy boxes"}
        </button>
      </form>

      {error && <p className="beeps-note-error" role="alert">{error}</p>}

      {draft && (
        <div className="beeps-note-result">
          <div className="beeps-note-result-meta">
            <strong>{draft.client} / {draft.sessionDate}</strong>
            <span>{draft.modelStatus === "generated" ? "Model-assisted cleanup" : "Fallback: model unavailable"}</span>
          </div>
          <p className="beeps-note-warning">Review every sentence against today's record. Nothing here is submitted or canonical.</p>
          {draft.modelError && <p className="beeps-note-error">{draft.modelError} Open Ollama on the Mac before the next draft if you want Beeps to rewrite the narrative with the local model.</p>}
          {draft.dataSheetWarnings?.length > 0 && (
            <div className="beeps-note-warning" role="alert">
              <strong>Data-sheet extraction notes</strong>
              {draft.dataSheetWarnings.map((warning) => <span key={warning}>{warning}</span>)}
            </div>
          )}
          {draft.copyBoxes.map((box) => (
            <div className="beeps-note-copy-box" key={box.id}>
              <div className="beeps-note-copy-heading">
                <strong>{box.label}</strong>
                <button type="button" onClick={() => copyText(box.value, () => setCopied(box.id))}>Copy</button>
              </div>
              <textarea value={box.value} readOnly aria-label={`${box.label} copy box`} rows={4} />
              {copied === box.id && <small role="status">Copied.</small>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
