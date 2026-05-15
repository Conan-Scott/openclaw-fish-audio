---
name: fish-audio-tts
description: Use when writing, sending, testing, or troubleshooting text-to-speech through the Fish Audio speech provider, especially expressive voice messages, voice notes, Fish Audio marker syntax, provider-specific TTS directives, voice selection, or channel delivery checks.
---

# Fish Audio TTS

## Overview

Fish Audio is an OpenClaw speech provider. OpenClaw sends the final spoken text to Fish Audio; the provider returns audio for delivery as a voice note or audio file depending on the channel.

Write text for the ear, not for the screen.

## When To Use

Use this skill when:

- Sending or drafting TTS through Fish Audio.
- Testing Fish Audio provider behavior, voices, models, latency, or expressive markers.
- Troubleshooting whether a TTS issue is provider synthesis or channel delivery.
- Using Fish Audio voice IDs or provider-prefixed TTS directives.
- Working with cloned, trained, or community Fish Audio voices.

Do not use this skill for unrelated audio providers unless comparing Fish Audio against them.

## Workflow

1. Confirm the user wants spoken audio, not normal displayed text.
2. Keep the spoken payload short unless the user asks for narration.
3. Use plain natural language.
4. Add Fish expressive markers only when they improve the spoken result.
5. If changing voice, model, speed, latency, temperature, or top-p, use Fish Audio provider-prefixed directives.
6. When debugging, separate provider synthesis from OpenClaw delivery/rendering.

## Spoken Text Rules

- Avoid Markdown, bullets, tables, code fences, raw URLs, and emoji unless they should be spoken literally.
- Do not use Markdown stage directions such as `*laughs*`; some TTS paths may speak the punctuation.
- Prefer Fish-style expressive markers in round brackets, inline with the sentence: `(laughs)`, `(sighs)`.
- Unknown markers are passed through to Fish Audio. Do not claim OpenClaw validates, rewrites, or interprets them.
- Avoid long parenthetical direction. Keep markers sparse.

Good:

```text
That worked. (laughs) Nice catch.
```

```text
I found the issue. (sighs) The provider worked, but delivery failed.
```

Bad:

```text
*Laughs* That worked!
```

```text
- First thing
- Second thing
```

## Directives

Use Fish Audio provider-prefixed directives so other speech providers do not accidentally claim the token.

Supported long forms:

```text
[[tts:fishaudio_voice=<voice_id>]]
[[tts:fishaudio_speed=1.2]]
[[tts:fishaudio_model=s1]]
[[tts:fishaudio_latency=low]]
[[tts:fishaudio_temperature=0.7]]
[[tts:fishaudio_top_p=0.8]]
```

Short aliases:

```text
[[tts:fish_voice=<voice_id>]]
[[tts:fish_speed=1.2]]
[[tts:fish_model=s1]]
[[tts:fish_latency=low]]
[[tts:fish_temperature=0.7]]
[[tts:fish_top_p=0.8]]
```

Only use a voice ID when the user supplied it, selected it, or explicitly asked to use a known configured voice.

## Safety

- Do not expose or speak API keys, tokens, credentials, or secrets.
- Prefer environment or secret-backed API key configuration over inline config examples.
- Use revocable Fish Audio API keys.
- Do not use a custom Fish Audio base URL unless it is trusted; the API key is sent to that endpoint.
- Use cloned or trained voices only with appropriate rights, consent, and authorization.
- Do not imitate a private person, coworker, or public figure without clear authorization.

## Troubleshooting

When Fish Audio output does not arrive or play, distinguish synthesis from delivery before changing provider settings. Check whether Fish Audio accepted the request and produced audio, then check OpenClaw command handling, media attachment, and the target channel's rendering path.
