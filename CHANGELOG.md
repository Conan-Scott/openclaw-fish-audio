# Changelog

## 1.1.5 (2026-05-15)

- Republish the corrected Fish Audio package after registry publish-token setup, keeping the structured skill, setup auth metadata, HTTPS baseUrl hardening, and ClawHub static-scan false-positive adjustment from 1.1.4.

## 1.1.4 (2026-05-15)

- Publish through ClawHub's ClawPack npm artifact path instead of the legacy source-zip path.
- Adjust sensitive API key config normalization to avoid ClawHub static-scan false positives that mistake config property handling for a hardcoded secret.

## 1.1.3 (2026-05-15)

- Replace the bundled Fish Audio AgentSkill with a structured `SKILL.md` covering when to use the provider, spoken-text guidance, directives, safety, and troubleshooting.
- Add setup/auth metadata for `FISH_AUDIO_API_KEY` while keeping existing sensitive API key UI hints.
- Harden custom Fish Audio `baseUrl` handling by requiring HTTPS for non-local endpoints and rejecting embedded credentials.
- Refresh OpenClaw SDK build metadata to 2026.5.12 and update documentation to prefer revocable, secret-backed API keys and consent-based voice use.

## 1.1.2 (2026-05-04)

- Set `activation.onStartup: false` so Fish Audio stays lazy and relies on OpenClaw 2026.5.3 capability-provider fallback rather than startup-loading every gateway boot.

## 1.1.1 (2026-05-04)

- Ship compiled `dist/*.js` runtime output and use the compiled entrypoint for packaged installs on OpenClaw 2026.5.3-beta.2.
- Set `activation.onStartup: true` explicitly for startup registration of the Fish Audio speech provider.
- Refresh OpenClaw build metadata for SDK 2026.5.3-beta.2.

## 1.1.0 (2026-04-30)

- Refresh OpenClaw build metadata for SDK 2026.4.27.
- Add local regression coverage for plugin registration, config resolution, configured-state checks, synthesis request shape, voice-note output, voice pagination, and voice deduplication.
- Document Fish Audio expressive marker behavior: round-bracket markers are passed through verbatim and confirmed working; square-bracket markers remain unverified.
- Bundle a `fish-audio-tts` AgentSkill so agents avoid Markdown stage directions in voice text and prefer Fish-compatible round-bracket expressive markers.

## 1.0.0 (2026-04-04)

Initial release as a standalone community plugin.

- Fish Audio S2-Pro and S1 model support
- Dynamic voice listing with pagination (user clones + popular community voices)
- Format-aware output: opus for voice notes, mp3 otherwise
- Provider-prefixed inline directives (`fishaudio_*` / `fish_*`)
- Full config schema with validation
- Latency mode selection (normal, balanced, low)
- Prosody speed control (0.5–2.0)
- Temperature and top-p sampling controls

Previously developed as a bundled plugin PR ([#56891](https://github.com/openclaw/openclaw/pull/56891)).
