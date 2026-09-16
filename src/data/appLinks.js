const configuredUrl = (value) => {
  const candidate = value?.trim();
  return candidate && /^https?:\/\//.test(candidate) ? candidate : null;
};

const environment = import.meta.env || {};

const configuredGameHubUrl = (value) => {
  const candidate = configuredUrl(value);
  if (!candidate) return null;
  try {
    const hostname = new URL(candidate).hostname;
    if (hostname === "chatgpt.site" || hostname.endsWith(".chatgpt.site")) return null;
  } catch {
    return null;
  }
  return candidate;
};

const configuredNavigatorUrl = configuredUrl(environment.VITE_BEE_BRAIN_NAVIGATOR_URL);
const navigatorApiUrl = environment.PROD
  ? "/api/brain"
  : configuredUrl(environment.VITE_BEE_BRAIN_API_URL)
    || "http://127.0.0.1:4173";
const gameHubUrl = configuredGameHubUrl(environment.VITE_GAME_HUB_URL)
  || "https://gamehub.beemissioncontrol.com";

export const appLinks = {
  navigator: {
    label: "Open Bee Brain Navigator",
    description: "Protected, read-only source lookup.",
    url: configuredNavigatorUrl
      || (environment.PROD ? "https://brain.beemissioncontrol.com" : "http://127.0.0.1:4173"),
    apiUrl: navigatorApiUrl,
  },
  gameHub: {
    label: "Open Game Hub",
    description: "Separate client-facing recreation vessel.",
    url: gameHubUrl,
    statusUrl: `${gameHubUrl}/api/status`,
  },
};
