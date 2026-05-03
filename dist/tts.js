const DEFAULT_FISH_AUDIO_BASE_URL = "https://api.fish.audio";
function normalizeFishAudioBaseUrl(baseUrl) {
  const trimmed = baseUrl?.trim();
  if (!trimmed) {
    return DEFAULT_FISH_AUDIO_BASE_URL;
  }
  return trimmed.replace(/\/+$/, "");
}
async function fishAudioTTS(params) {
  const {
    text,
    apiKey,
    baseUrl,
    referenceId,
    model,
    format,
    latency,
    speed,
    temperature,
    topP,
    timeoutMs
  } = params;
  if (!text.trim()) {
    throw new Error("Fish Audio TTS: empty text");
  }
  if (!referenceId.trim()) {
    throw new Error("Fish Audio TTS: missing reference_id (voice)");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${normalizeFishAudioBaseUrl(baseUrl)}/v1/tts`;
    const body = {
      text,
      reference_id: referenceId,
      format
    };
    if (latency && latency !== "normal") {
      body.latency = latency;
    }
    if (speed != null) {
      body.prosody = { speed };
    }
    if (temperature != null) {
      body.temperature = temperature;
    }
    if (topP != null) {
      body.top_p = topP;
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorBody = await response.text();
        const truncated = errorBody.length > 500 ? `${errorBody.slice(0, 500)}\u2026` : errorBody;
        errorDetail = truncated ? `: ${truncated}` : "";
      } catch {
      }
      throw new Error(`Fish Audio API error (${response.status})${errorDetail}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      throw new Error("Fish Audio TTS produced empty audio");
    }
    return buffer;
  } finally {
    clearTimeout(timeout);
  }
}
async function listFishAudioVoices(params) {
  const base = normalizeFishAudioBaseUrl(params.baseUrl);
  const PAGE_SIZE = 100;
  const headers = { Authorization: `Bearer ${params.apiKey}` };
  const ownItems = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${base}/model?type=tts&self=true&page_size=${PAGE_SIZE}&page_number=${page}`,
      { headers }
    );
    if (!res.ok) {
      throw new Error(`Fish Audio voices API error (${res.status})`);
    }
    const json = await res.json();
    if (!Array.isArray(json.items) || json.items.length === 0) {
      break;
    }
    ownItems.push(...json.items);
    if (typeof json.total === "number" && ownItems.length >= json.total || json.items.length < PAGE_SIZE) {
      break;
    }
    page++;
  }
  let popularItems = [];
  try {
    const res = await fetch(
      `${base}/model?type=tts&sort_by=score&page_size=${PAGE_SIZE}&page_number=1`,
      { headers }
    );
    if (res.ok) {
      const json = await res.json();
      popularItems = Array.isArray(json.items) ? json.items : [];
    }
  } catch {
  }
  const seen = /* @__PURE__ */ new Set();
  const merged = [];
  for (const v of [...ownItems, ...popularItems]) {
    const id = v._id?.trim() ?? "";
    if (id.length === 0 || seen.has(id)) continue;
    seen.add(id);
    merged.push({ id, name: v.title?.trim() || id });
  }
  return merged;
}
export {
  DEFAULT_FISH_AUDIO_BASE_URL,
  fishAudioTTS,
  listFishAudioVoices,
  normalizeFishAudioBaseUrl
};
