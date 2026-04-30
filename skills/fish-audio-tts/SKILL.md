---
name: fish-audio-tts
description: Use when writing or sending text-to-speech through the Fish Audio speech provider, especially expressive voice messages, voice notes, or tests involving Fish Audio markers.
---

# Fish Audio TTS

Fish Audio receives the final text payload from OpenClaw. Write text that should be spoken, not displayed.

## Spoken text rules

- Keep TTS copy plain and natural. Avoid Markdown, bullets, code fences, URLs, and emoji unless they should be spoken literally.
- Do not use Markdown emphasis for emotion or stage direction. `*laughs*` may be read as “asterisk laughs asterisk”.
- Use Fish-style expressive markers in round brackets, inline with the spoken sentence: `(laughs)`, `(sighs)`.
- Unknown markers are passed through to Fish Audio; do not claim OpenClaw validates or interprets them.
- Keep agent-sent voice short unless the user explicitly asks for a long narration.

## Good examples

```text
That worked. (laughs) Nice catch.
```

```text
I found the problem. (sighs) It was attachment delivery, not synthesis.
```

## Bad examples

```text
*Laughs* That worked!
```

```text
- First thing
- Second thing
```

## Testing pattern

When asked to test Fish Audio behavior, prefer a small matrix:

1. Plain baseline sentence.
2. One sentence with `(laughs)`.
3. One sentence with `(sighs)` or another explicitly requested marker.
4. If testing delivery, compare the same payload across channels before blaming the provider.
