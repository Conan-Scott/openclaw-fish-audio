# Changelog

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
