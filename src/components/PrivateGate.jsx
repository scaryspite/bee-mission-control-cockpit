import { useEffect, useState } from "react";

const SESSION_KEY = "bmc-private-bridge";

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function PrivateGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () =>
      !import.meta.env.PROD &&
      window.sessionStorage.getItem(SESSION_KEY) === "unlocked",
  );

  const [checkingServerAccess, setCheckingServerAccess] = useState(
    import.meta.env.PROD,
  );

  const [phrase, setPhrase] = useState("");
  const [message, setMessage] = useState("");
  const configuredHash = import.meta.env.VITE_BMC_ACCESS_HASH?.trim().toLowerCase();

  useEffect(() => {
    if (!import.meta.env.PROD) return undefined;

    fetch("/__auth", { credentials: "include" })
      .then(async (response) => {
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok || !contentType.includes("application/json")) {
          return;
        }

        const data = await response.json();

        if (data?.authenticated === true) {
          setUnlocked(true);
        }
      })
      .catch(() => {
        // Fail closed. An unavailable auth service must never unlock the cockpit.
      })
      .finally(() => setCheckingServerAccess(false));

    return undefined;
  }, []);

  const openSession = () => {
    window.sessionStorage.setItem(SESSION_KEY, "unlocked");
    setUnlocked(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (import.meta.env.PROD) {
      const response = await fetch("/__auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ passphrase: phrase.trim() }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();

        if (data?.authenticated === true) {
          window.location.reload();
          return;
        }
      }

      setMessage("That key did not open the bridge.");
      setPhrase("");
      return;
    }

    if (!configuredHash) {
      setMessage("Access key is not provisioned for this deployment.");
      return;
    }

    const candidateHash = await sha256(phrase.trim());

    if (candidateHash === configuredHash) {
      openSession();
      return;
    }

    setMessage("That key did not open the bridge.");
    setPhrase("");
  };

  if (unlocked) return children;
  if (checkingServerAccess) return null;

  return (
    <main className="private-gate">
      <div className="private-gate-corner">BMC-01 // PRIVATE NETWORK</div>

      <section className="private-gate-content" aria-labelledby="private-gate-title">
        <p className="private-gate-kicker">Encrypted bridge access</p>
        <h1 id="private-gate-title">Bee Mission Control</h1>

        <p className="private-gate-copy">
          A private command room for one captain. The bridge stays sealed until
          its access key is verified.
        </p>

        <form className="private-gate-form" onSubmit={handleSubmit}>
          <label htmlFor="bridge-key">Access key</label>

          <input
            id="bridge-key"
            type="password"
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            placeholder="enter private key"
            autoComplete="current-password"
          />

          <button type="submit">Unlock bridge</button>
        </form>

        {import.meta.env.DEV && (
          <button className="private-gate-local" type="button" onClick={openSession}>
            Open local preview
          </button>
        )}

        <p className="private-gate-message" role="alert" aria-live="polite">
          {message || "Passphrase verification uses the browser's Web Crypto channel."}
        </p>
      </section>

      <footer className="private-gate-footer">
        <span>SESSION SEALED</span>
        <span>LOCAL / PRIVATE / CAPTAIN ONLY</span>
      </footer>
    </main>
  );
}

export default PrivateGate;
