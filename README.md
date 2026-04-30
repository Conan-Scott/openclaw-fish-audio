# Fish Audio Speech — OpenClaw Plugin

[Fish Audio](https://fish.audio) TTS plugin for [OpenClaw](https://openclaw.ai), with high-quality voice cloning, Telegram/WhatsApp voice replies, and access to 1M+ voices via Fish Audio's voice library. Supports S2-Pro and S1 models.

## Features

- **Voice cloning** — use any Fish Audio voice (your own clones or community voices)
- **S2-Pro & S1 models** — latest Fish Audio TTS models
- **Format-aware output** — opus for voice notes (Telegram, WhatsApp), mp3 otherwise
- **Inline directives** — control voice, speed, model, latency, and sampling per-message
- **Bundled agent skill** — teaches agents to write Fish-friendly voice text and expressive markers
- **Voice listing** — browse your cloned voices and popular community voices via `/voice list`

## Installation

```bash
openclaw plugins install @conan-scott/openclaw-fish-audio
```

Then restart OpenClaw.

## Getting an API Key

1. Sign up at [fish.audio](https://fish.audio)
2. Go to **Account** → **API Keys** → **Create API Key**
3. Copy the key for configuration below

## Configuration

Add to your `openclaw.json`:

```json5
{
  messages: {
    tts: {
      provider: "fish-audio",
      providers: {
        "fish-audio": {
          apiKey: "your-fish-audio-api-key",
          voiceId: "reference-id-of-your-voice",
          model: "s2-pro",       // s2-pro (default) | s1
          latency: "normal",     // normal (default) | balanced | low
          // speed: 1.0,         // 0.5–2.0 (optional)
          // temperature: 0.7,   // 0–1 (optional)
          // topP: 0.8,          // 0–1 (optional)
        },
      },
    },
  },
}
```

Alternatively, set the `FISH_AUDIO_API_KEY` environment variable and configure only `voiceId`.

## Finding a Voice

Use the `/voice list` command in OpenClaw to browse available voices. The plugin shows:

1. **Your cloned/trained voices** (all pages, via `self=true`)
2. **Popular community voices** (top-ranked by score) as a fallback for new users

You can also browse voices at [fish.audio](https://fish.audio) and copy the voice ID from the URL.

## Inline Directives

All directive keys are provider-prefixed to avoid collisions with other speech providers. Both `fishaudio_*` and shorter `fish_*` aliases work.

```
[[tts:fishaudio_voice=<ref_id>]]         Switch voice
[[tts:fishaudio_speed=1.2]]              Prosody speed (0.5–2.0)
[[tts:fishaudio_model=s1]]               Model override
[[tts:fishaudio_latency=low]]            Latency mode
[[tts:fishaudio_temperature=0.7]]        Sampling temperature (0–1)
[[tts:fishaudio_top_p=0.8]]              Top-p sampling (0–1)
```

Short aliases: `fish_voice`, `fish_speed`, `fish_model`, `fish_latency`, `fish_temperature`, `fish_top_p`.

## Expressive Markers

Fish Audio understands natural expressive markers in the text itself, such as `(laughs)` or `(sighs)`. OpenClaw does not parse or transform these markers; the plugin passes text verbatim to Fish Audio's `/v1/tts` API. Round-bracket markers are confirmed working. Square-bracket marker syntax is unverified.

For agent-authored voice messages, avoid Markdown stage directions such as `*laughs*`; some TTS paths may read the asterisks literally. This package includes a `fish-audio-tts` AgentSkill so OpenClaw agents can learn the preferred plain-text style automatically.

## Models

| Model | Description |
|-------|-------------|
| `s2-pro` | Latest high-quality model (default) |
| `s1` | Previous generation, lighter weight |

## Latency Modes

| Mode | Description |
|------|-------------|
| `normal` | Best quality, higher latency (default) |
| `balanced` | Balance between quality and speed |
| `low` | Fastest response, may reduce quality |

## Troubleshooting

- **No voice configured**: Set `voiceId` in config. Fish Audio has no universal default voice.
- **Empty voice list**: New users with no cloned voices will see popular community voices as a starting point.
- **API key missing**: Set either `apiKey` in config or `FISH_AUDIO_API_KEY` env var.

## License

MIT
