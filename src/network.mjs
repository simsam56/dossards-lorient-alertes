const USER_AGENT =
  "Mozilla/5.0 (compatible; dossards-lorient-alertes/1.0; +https://github.com/simsam56/dossards-lorient-alertes)";

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPage(url, fetchImpl = fetch) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return response.text();
      lastError = new Error(`HTTP ${response.status} pour ${url}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.name === "AbortError" || lastError.name === "TimeoutError") {
        lastError = new Error(`Délai dépassé pour ${url}`);
      }
    }
    await sleep(1_000 * (attempt + 1));
  }
  throw lastError;
}

export async function sendNtfy({ topic, title, message, clickUrl, fetchImpl = fetch }) {
  if (!topic) throw new Error("NTFY_TOPIC manquant — définir le secret GitHub NTFY_TOPIC");
  const response = await fetchImpl("https://ntfy.sh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      title,
      message,
      click: clickUrl,
      priority: 4,
      tags: ["running", "athletic_shoe"],
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`ntfy HTTP ${response.status}`);
}
