import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pluginEntry from "./index.js";
import { buildFishAudioSpeechProvider, isValidFishAudioVoiceId } from "./speech-provider.js";

const validVoiceId = "8a2d42279389471993460b85340235c5";
const audioBytes = new Uint8Array([1, 2, 3, 4]);

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function audioResponse(bytes = audioBytes, init: ResponseInit = {}) {
  return new Response(bytes, {
    status: 200,
    headers: { "Content-Type": "audio/mpeg" },
    ...init,
  });
}

function getFetchCall(index = 0) {
  const call = vi.mocked(fetch).mock.calls[index];
  if (!call) throw new Error(`missing fetch call ${index}`);
  const [url, init] = call as [string, RequestInit];
  return { url, init };
}

function parseJsonBody(init: RequestInit): Record<string, unknown> {
  expect(typeof init.body).toBe("string");
  return JSON.parse(init.body as string) as Record<string, unknown>;
}

function expectHeader(init: RequestInit, key: string, value: string) {
  const headers = init.headers as Record<string, string>;
  expect(headers[key]).toBe(value);
}

describe("fish-audio plugin entry", () => {
  it("registers the Fish Audio speech provider through the plugin SDK entry", () => {
    const registerSpeechProvider = vi.fn();

    pluginEntry.register({ registerSpeechProvider } as never);

    expect(registerSpeechProvider).toHaveBeenCalledTimes(1);
    expect(registerSpeechProvider.mock.calls[0]?.[0]).toMatchObject({
      id: "fish-audio",
      label: "Fish Audio",
      models: ["s2-pro", "s1"],
    });
  });
});

describe("fish-audio speech provider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.FISH_AUDIO_API_KEY;
  });

  describe("isValidFishAudioVoiceId", () => {
    it("accepts valid Fish Audio ref IDs (20-64 alphanumeric chars)", () => {
      const valid = [
        "8a2d42279389471993460b85340235c5", // 32 char hex - standard
        "0dad9e24630447cf97803f4beee10481", // 32 char hex
        "d8b0991f96b44e489422ca2ddf0bd31d", // 32 char hex - author id
        "aabbccddee112233445566778899aabb", // 32 char hex
        "abcdefABCDEF12345678901234567890", // mixed case alphanumeric
        "a1b2c3d4e5f6g7h8i9j0", // 20 char (minimum)
        "a".repeat(64), // 64 char (maximum)
      ];
      for (const v of valid) {
        expect(isValidFishAudioVoiceId(v), `expected valid: ${v}`).toBe(true);
      }
    });

    it("rejects invalid voice IDs", () => {
      const invalid = [
        "", // empty
        "abc123", // too short (6)
        "1234567890123456789", // 19 chars - below minimum
        "a".repeat(65), // too long (65)
        "8a2d4227-9389-4719-9346-0b85340235c5", // UUID with dashes
        "../../../etc/passwd", // path traversal
        "voice?param=value", // query string
        "hello world 1234567890", // spaces
        "abcdef!@#$%^&*()12345678", // special chars
      ];
      for (const v of invalid) {
        expect(isValidFishAudioVoiceId(v), `expected invalid: ${v}`).toBe(false);
      }
    });
  });

  describe("configuration", () => {
    it("resolves provider config from the OpenClaw TTS provider map", () => {
      const provider = buildFishAudioSpeechProvider();

      expect(
        provider.resolveConfig({
          rawConfig: {
            providers: {
              "fish-audio": {
                apiKey: " key ",
                voiceId: validVoiceId,
                baseUrl: " https://example.test/// ",
                model: "s1",
                latency: "low",
                speed: 1.2,
                temperature: 0.7,
                topP: 0.8,
              },
            },
          },
        }),
      ).toEqual({
        apiKey: "key",
        voiceId: validVoiceId,
        baseUrl: "https://example.test",
        model: "s1",
        latency: "low",
        speed: 1.2,
        temperature: 0.7,
        topP: 0.8,
      });
    });

    it("requires both an API key and voice ID to be configured", () => {
      const provider = buildFishAudioSpeechProvider();

      expect(provider.isConfigured({ providerConfig: {} })).toBe(false);
      expect(provider.isConfigured({ providerConfig: { apiKey: "key" } })).toBe(false);
      expect(provider.isConfigured({ providerConfig: { voiceId: validVoiceId } })).toBe(false);
      expect(
        provider.isConfigured({ providerConfig: { apiKey: "key", voiceId: validVoiceId } }),
      ).toBe(true);
    });
  });

  describe("parseDirectiveToken", () => {
    const provider = buildFishAudioSpeechProvider();
    const parse = provider.parseDirectiveToken!;

    const policy = {
      enabled: true,
      allowVoice: true,
      allowModelId: true,
      allowVoiceSettings: true,
      allowProvider: true,
      allowText: true,
      allowNormalization: true,
      allowSeed: true,
    };

    it("handles provider-prefixed voice keys", () => {
      const voiceId = validVoiceId;
      for (const key of ["fishaudio_voice", "fish_voice", "fishaudio_voiceid"]) {
        const result = parse({ key, value: voiceId, policy, currentOverrides: {} });
        expect(result.handled, `${key} should be handled`).toBe(true);
        expect(result.overrides?.voiceId).toBe(voiceId);
      }
    });

    it("handles provider-prefixed model keys", () => {
      for (const key of ["fishaudio_model", "fish_model"]) {
        const result = parse({ key, value: "s1", policy, currentOverrides: {} });
        expect(result.handled, `${key} should be handled`).toBe(true);
        expect(result.overrides?.model).toBe("s1");
      }
    });

    it("handles provider-prefixed speed keys", () => {
      for (const key of ["fishaudio_speed", "fish_speed"]) {
        const result = parse({ key, value: "1.5", policy, currentOverrides: {} });
        expect(result.handled, `${key} should be handled`).toBe(true);
        expect(result.overrides?.speed).toBe(1.5);
      }
    });

    it("handles provider-prefixed latency keys", () => {
      for (const key of ["fishaudio_latency", "fish_latency"]) {
        const result = parse({ key, value: "low", policy, currentOverrides: {} });
        expect(result.handled, `${key} should be handled`).toBe(true);
        expect(result.overrides?.latency).toBe("low");
      }
    });

    it("does NOT claim generic keys (voice, model, speed)", () => {
      for (const key of [
        "voice",
        "model",
        "speed",
        "voiceid",
        "voice_id",
        "modelid",
        "model_id",
        "latency",
        "temperature",
        "temp",
        "top_p",
        "topp",
      ]) {
        const result = parse({ key, value: "anything", policy, currentOverrides: {} });
        expect(result.handled, `generic key "${key}" should NOT be handled`).toBe(false);
      }
    });

    it("rejects invalid voice ID with warning", () => {
      const result = parse({ key: "fishaudio_voice", value: "bad!", policy, currentOverrides: {} });
      expect(result.handled).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
      expect(result.overrides).toBeUndefined();
    });

    it("validates speed range", () => {
      const result = parse({ key: "fishaudio_speed", value: "5.0", policy, currentOverrides: {} });
      expect(result.handled).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
    });

    it("rejects invalid latency values with warning instead of silently defaulting", () => {
      const result = parse({
        key: "fishaudio_latency",
        value: "fast",
        policy,
        currentOverrides: {},
      });
      expect(result.handled).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
      expect(result.overrides).toBeUndefined();
    });

    it("accepts valid latency values", () => {
      for (const value of ["normal", "balanced", "low"]) {
        const result = parse({ key: "fishaudio_latency", value, policy, currentOverrides: {} });
        expect(result.handled).toBe(true);
        expect(result.overrides?.latency).toBe(value);
        expect(result.warnings).toBeUndefined();
      }
    });
  });

  describe("synthesize", () => {
    it("sends MP3 synthesis requests with the configured model header", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(audioResponse());
      const provider = buildFishAudioSpeechProvider();

      const result = await provider.synthesize({
        text: "Hello from Fish Audio",
        providerConfig: {
          apiKey: "fish-key",
          voiceId: validVoiceId,
          baseUrl: "https://fish.example///",
          model: "s2-pro",
        },
        timeoutMs: 1234,
      });

      expect(result.outputFormat).toBe("mp3");
      expect(result.fileExtension).toBe(".mp3");
      expect(result.voiceCompatible).toBe(false);
      expect(Buffer.from(result.audioBuffer)).toEqual(Buffer.from(audioBytes));

      const { url, init } = getFetchCall();
      expect(url).toBe("https://fish.example/v1/tts");
      expect(init.method).toBe("POST");
      expectHeader(init, "Authorization", "Bearer fish-key");
      expectHeader(init, "Content-Type", "application/json");
      expectHeader(init, "model", "s2-pro");
      expect(parseJsonBody(init)).toEqual({
        text: "Hello from Fish Audio",
        reference_id: validVoiceId,
        format: "mp3",
      });
    });

    it("uses opus and provider overrides for voice-note targets", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(audioResponse());
      const provider = buildFishAudioSpeechProvider();

      const result = await provider.synthesize({
        text: "Voice note",
        target: "voice-note",
        providerConfig: {
          apiKey: "fish-key",
          voiceId: validVoiceId,
          model: "s2-pro",
          latency: "normal",
        },
        providerOverrides: {
          model: "s1",
          speed: 1.25,
          latency: "low",
          temperature: 0.4,
          topP: 0.9,
        },
        timeoutMs: 1234,
      });

      expect(result.outputFormat).toBe("opus");
      expect(result.fileExtension).toBe(".opus");
      expect(result.voiceCompatible).toBe(true);

      const { init } = getFetchCall();
      expectHeader(init, "model", "s1");
      expect(parseJsonBody(init)).toEqual({
        text: "Voice note",
        reference_id: validVoiceId,
        format: "opus",
        latency: "low",
        prosody: { speed: 1.25 },
        temperature: 0.4,
        top_p: 0.9,
      });
    });
  });

  describe("listVoices", () => {
    it("paginates own voices, fetches popular voices, and deduplicates with own voices first", async () => {
      const firstOwnPage = [
        { _id: "own1", title: "My Voice" },
        { _id: "shared", title: "Owned Shared" },
        ...Array.from({ length: 98 }, (_, index) => ({
          _id: `own-extra-${index}`,
          title: `Extra Voice ${index}`,
        })),
      ];

      vi.mocked(fetch)
        .mockResolvedValueOnce(
          jsonResponse({
            total: 101,
            items: firstOwnPage,
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            total: 101,
            items: [{ _id: "own2", title: "Second Voice" }],
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            items: [
              { _id: "shared", title: "Popular Shared" },
              { _id: "popular", title: "Popular Voice" },
              { _id: " ", title: "ignored" },
            ],
          }),
        );

      const provider = buildFishAudioSpeechProvider();
      const voices = await provider.listVoices({
        apiKey: "fish-key",
        baseUrl: "https://fish.example/",
      });

      expect(voices).toHaveLength(102);
      expect(voices.slice(0, 2)).toEqual([
        { id: "own1", name: "My Voice" },
        { id: "shared", name: "Owned Shared" },
      ]);
      expect(voices).toContainEqual({ id: "own2", name: "Second Voice" });
      expect(voices).toContainEqual({ id: "popular", name: "Popular Voice" });
      expect(voices.filter((voice) => voice.id === "shared")).toEqual([
        { id: "shared", name: "Owned Shared" },
      ]);
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(getFetchCall(0).url).toBe(
        "https://fish.example/model?type=tts&self=true&page_size=100&page_number=1",
      );
      expect(getFetchCall(1).url).toBe(
        "https://fish.example/model?type=tts&self=true&page_size=100&page_number=2",
      );
      expect(getFetchCall(2).url).toBe(
        "https://fish.example/model?type=tts&sort_by=score&page_size=100&page_number=1",
      );
    });
  });
});
