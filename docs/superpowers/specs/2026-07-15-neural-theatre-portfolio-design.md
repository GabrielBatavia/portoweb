# Neural Theatre Portfolio Redesign

**Date:** 2026-07-15

**Status:** Approved for implementation

**Primary audience:** Recruiters hiring for AI engineering internships and junior roles

**Content source of truth:** `CV Gabriel Batavia.pdf`, supplied by Gabriel Batavia

## 1. Objective

Redesign Gabriel Batavia's portfolio as an AI-first conversational experience that feels exceptional for a junior candidate while remaining credible, fast, and easy for recruiters to verify.

The portfolio must communicate one clear position:

> Gabriel builds practical AI systems for industry, accessibility, and robotics.

The first screen is not a conventional hero, dashboard, or grid of cards. It is a full-screen cinematic conversation with a near-photoreal 2.5D representation of Gabriel. Recruiters can speak with Gabriel through text, explore verified experience, and open the CV without depending on the AI interaction.

## 2. Design Principles

1. **Character first.** Gabriel is the main interface, not a decorative mascot.
2. **Conversation over navigation.** Recruiters may ask questions naturally, while deterministic controls remain available for reliability.
3. **Verified evidence only.** Every professional claim must come from the supplied CV or explicitly approved portfolio data.
4. **Cinematic, not ornamental.** Depth, lighting, motion, and typography create the premium feel. Gold gradients, generic glass cards, and decorative AI orbs are excluded.
5. **Accessible without AI.** Profile, experience, work, recognition, CV, and contact information remain available if the chat service is unavailable.
6. **Fast enough for recruiters.** The character and motion system must degrade gracefully on slow devices and respect reduced-motion preferences.

## 3. Experience Concept: Neural Theatre

### 3.1 Opening scene

The initial viewport is a full-screen graphite digital stage.

- Gabriel appears as a near-photoreal close-up bust on the right side of desktop layouts.
- The left side contains the opening line, generated transcript, suggested questions, and the `Ask Gabriel` input.
- The character performs a short camera-settle entrance, subtle breathing, and a blink before greeting the visitor.
- The default greeting is:

  > Hi, I'm Gabriel. You can explore my work - or just ask me anything.

- A subtle disclosure reads: `AI-powered representation based on Gabriel's verified profile.`
- Voice input and spoken output are explicitly out of scope for this implementation, but the interaction state model must leave room for them.

### 3.2 Conversation behavior

The user can type a question or select a suggested prompt. Initial suggestions include:

- `Why should we hire you for an AI engineering internship?`
- `Show me your strongest computer vision experience.`
- `Have you shipped AI into real products?`
- `What makes you effective in a team?`

The UI moves through these states:

1. `idle` - Gabriel is attentive and the input is ready.
2. `listening` - the submitted question is acknowledged and the input is temporarily locked.
3. `thinking` - the character changes expression and the neural background converges toward the portrait.
4. `speaking` - streamed answer tokens appear in the transcript while the character uses the speaking state.
5. `error` - a calm fallback message appears and deterministic portfolio navigation remains usable.

### 3.3 Memory index

A compact `memory index` provides deterministic access to:

- Profile
- Experience
- Work
- Recognition
- Credentials
- CV
- Contact

Selecting an item opens an evidence layer within the same stage. Evidence layers use editorial typography, depth, and controlled motion instead of card grids. Gabriel remains visible so the experience still feels conversational.

### 3.4 Evidence layers

Evidence layers are built from the verified CV and organized as follows:

- **Professional experience:** PT Petrokimia Gresik, CV LetConnect Canada, and AROC_PL.
- **Selected work:** LLMForAutism, Sign Language Application, and IoT System for Forest Fire Prevention.
- **Recognition:** COMPFEST 16 awards, Electro Weeks second place, Compsphere Best Innovation, KMIPN second place, and UI/UX finalist recognition.
- **Credentials:** Microsoft Azure AI Engineer Associate, Azure AI-102, AWS re/Start 2025, and TOEIC 820.
- **Beyond engineering:** NVIDIA workshop assistance, speaking, mentoring, and KSPM IT staff experience.

The implementation must not repeat the current site's unsupported awards, fabricated metrics, incorrect email address, incorrect GPA, or invented project descriptions.

## 4. Visual System

### 4.1 Art direction

The selected art direction is `Neural Theatre`.

- **Base:** graphite and near-black.
- **Surface:** smoked silver and soft white.
- **AI accent:** electric iris used sparingly for state, focus, and neural motion.
- **Skin and character lighting:** preserved naturally without color casts that reduce likeness.
- **Typography:** a restrained modern grotesk for interface text and a distinctive editorial display face for key statements.
- **Layout:** asymmetric and cinematic, with generous negative space and no repeated card wall.

### 4.2 Motion language

- A custom canvas layer renders a low-density neural field.
- Cursor movement creates restrained parallax in the portrait and foreground layers.
- Thinking state pulls neural points toward the character's head.
- Speaking state propagates a soft wave from the portrait toward the transcript.
- Evidence layers enter from perceived depth using opacity, scale, blur, and clip-path transitions.
- Text responses reveal progressively from the API stream.
- `prefers-reduced-motion` disables parallax, continuous neural movement, and large transitions.

The motion system must use browser-native animation and `requestAnimationFrame`; a large animation framework is not required.

## 5. Character Asset Direction

### 5.1 Source and appearance

The supplied photo `WIN_20260527_12_48_48_Pro.jpg` is the facial reference. Existing anime-style character assets are not reused as the visual base.

The new character must be:

- Near-photoreal rather than cartoon or anime.
- A recognizable representation of Gabriel, retaining his wavy dark hair, facial structure, skin tone, and light facial hair.
- Framed as a close-up bust.
- Dressed in a black turtleneck and structured charcoal jacket.
- Lit with a soft key light, cool rim light, and subtle warm fill.
- Presented on a transparent background for compositing into the website.

### 5.2 Required states

Create a consistent master portrait, then derive these aligned variants from it:

1. `idle` - neutral, attentive eye contact.
2. `greeting` - small confident smile.
3. `thinking` - thoughtful gaze slightly away from camera.
4. `speaking` - engaged expression with a naturally open mouth.
5. `error` - calm, apologetic expression.

All variants must preserve the same camera angle, crop, clothing, lighting, and facial identity so CSS cross-fades do not visibly jump. Assets should be delivered as optimized transparent WebP files, with PNG masters retained when useful.

Actual lip synchronization is deferred until the future voice phase.

## 6. Frontend Architecture

The frontend remains lightweight and is deployed as its own Vercel project.

### 6.1 Proposed structure

```text
/
|-- index.html
|-- package.json
|-- src/
|   |-- main.js
|   |-- styles/
|   |   |-- tokens.css
|   |   |-- base.css
|   |   |-- scene.css
|   |   `-- responsive.css
|   |-- character/
|   |   `-- character-controller.js
|   |-- neural/
|   |   `-- neural-field.js
|   |-- chat/
|   |   |-- chat-client.js
|   |   `-- conversation-controller.js
|   `-- content/
|       `-- portfolio-data.js
|-- assets/
|   `-- character/
|-- vercel.json
`-- backend/
```

Vite supplies the frontend build and injects `VITE_API_BASE_URL`. The interface is implemented with semantic HTML, CSS, and focused JavaScript modules rather than adopting a UI framework.

### 6.2 Character controller

`character-controller.js` owns visual state transitions and exposes a small interface:

```js
character.setState('thinking');
character.setState('speaking');
character.setState('idle');
```

It preloads every required state, cross-fades aligned assets, applies restrained breathing/parallax, and falls back to the idle asset if a variant fails to load.

### 6.3 Responsive behavior

- Desktop uses the approved left-conversation/right-character composition.
- Tablet reduces character scale and moves the memory index into a compact rail.
- Mobile uses a vertical composition: character above, transcript and input below, memory index in a drawer.
- The input remains reachable above the software keyboard.
- Evidence layers remain scrollable and never trap keyboard focus.

## 7. Backend Architecture

The backend is a separate Vercel project rooted at `/backend`.

### 7.1 Proposed structure

```text
backend/
|-- api/
|   |-- health.js
|   `-- v1/
|       `-- chat.js
|-- src/
|   |-- deepseek.js
|   |-- http.js
|   |-- profile.js
|   `-- prompt.js
|-- data/
|   `-- verified-profile.json
|-- tests/
|   |-- chat.test.js
|   `-- prompt.test.js
|-- package.json
`-- vercel.json
```

### 7.2 Environment variables

- `DEEPSEEK_API_KEY` - required and available only in the backend deployment.
- `ALLOWED_ORIGINS` - comma-separated frontend production and preview origins.
- `DEEPSEEK_MODEL` - defaults to `deepseek-v4-flash` so the model can be updated without code changes.

### 7.3 API endpoints

#### `GET /health`

Returns backend availability without exposing secrets or calling DeepSeek.

#### `POST /v1/chat`

Request body:

```json
{
  "message": "Why should we hire you?",
  "history": [
    { "role": "user", "content": "Tell me about your CV experience." },
    { "role": "assistant", "content": "I have worked across..." }
  ]
}
```

Validation rules:

- `message` must be non-empty and no longer than 1,000 characters.
- `history` is optional and limited to the most recent eight messages.
- Only `user` and `assistant` history roles are accepted.
- Unknown fields are ignored or rejected consistently.

Successful responses use server-sent events:

```text
event: status
data: {"state":"thinking"}

event: delta
data: {"text":"I build practical..."}

event: done
data: {"finishReason":"stop"}
```

The backend transforms DeepSeek's streaming response into this stable frontend contract.

### 7.4 DeepSeek configuration

- Base URL: `https://api.deepseek.com`.
- Model: `deepseek-v4-flash` by default.
- Thinking mode: disabled for lower conversational latency.
- Streaming: enabled.
- The system prompt and verified profile are injected by the backend on every request.
- The client never supplies or overrides the system prompt.

### 7.5 Persona and grounding rules

Gabriel speaks in first person while the interface clearly labels the experience as AI-powered.

The system prompt must require the model to:

1. Use only `verified-profile.json` for biographical and professional facts.
2. Never invent metrics, technologies, links, dates, awards, or project status.
3. Say when information is not available.
4. Keep answers concise and recruiter-oriented.
5. Distinguish completed work from planned launches or future work.
6. Invite the recruiter to verify details through the CV or contact Gabriel when appropriate.
7. Avoid claiming to be the human currently typing in real time.

## 8. Frontend and Backend Connection

The frontend calls `${VITE_API_BASE_URL}/v1/chat`. The backend allows requests only from configured frontend origins and handles preflight requests.

Connection behavior:

- Use `AbortController` so a visitor can cancel a pending response.
- Prevent simultaneous submissions from the same browser session.
- Apply a visible timeout with a retry action.
- Keep chat history in memory for the current tab only; do not persist recruiter questions by default.
- Do not add a database, authentication, analytics, or conversation logging in this phase.

## 9. Error Handling

- **Character asset failure:** show the idle fallback or a static portrait.
- **Neural canvas failure:** preserve the conversation UI without the background effect.
- **Backend unavailable:** show the deterministic memory index and contact actions.
- **DeepSeek timeout or upstream error:** return a safe error event without upstream internals.
- **Invalid request:** return a structured `400` response.
- **Disallowed origin:** return `403`.
- **Missing backend configuration:** return `503` from the chat route; `/health` reports degraded configuration without revealing which secret is missing.

## 10. Accessibility, Privacy, and Performance

- Meet WCAG AA contrast for all essential text and controls.
- Support full keyboard navigation, visible focus, semantic landmarks, and polite live-region announcements for streamed text.
- Provide descriptive alternative text for the character and evidence imagery.
- Respect reduced motion and high-contrast user preferences.
- Use responsive image formats and preload only the idle and greeting states initially.
- Lazy-load remaining character states and evidence media.
- Do not store recruiter questions by default.
- Do not expose API keys, internal prompts, stack traces, or upstream error bodies.

## 11. Validation

### Frontend

- Production build succeeds.
- Character states transition without layout shift.
- Keyboard-only navigation reaches the input, prompt suggestions, memory index, evidence layers, CV, and contact actions.
- Reduced-motion mode removes continuous movement.
- Desktop, tablet, and mobile layouts pass visual review.
- Chat failure leaves the verified portfolio accessible.

### Backend

- Type or syntax checks succeed.
- Unit tests cover request validation, CORS, prompt assembly, history trimming, and upstream error mapping.
- `/health` returns the expected status.
- `/v1/chat` rejects invalid JSON, overlong messages, invalid history, and disallowed origins.
- A mocked DeepSeek stream is forwarded correctly as `status`, `delta`, `done`, and `error` events.
- The real API is tested only after the user supplies `DEEPSEEK_API_KEY` in the backend environment.

### Production

- Frontend and backend production URLs return `200` where expected.
- The real frontend origin is included in `ALLOWED_ORIGINS`.
- The API key is absent from frontend bundles and network responses.
- Vercel project protection settings allow the intended public frontend-to-backend request.
- A complete recruiter conversation works on desktop and mobile.

## 12. Out of Scope

- Voice input, text-to-speech, or lip synchronization.
- User accounts, authentication, database storage, and recruiter analytics.
- Training or fine-tuning a custom language model.
- A fully rigged 3D avatar or WebGL character model.
- Unsupported portfolio claims, generated testimonials, or fabricated client details.

## 13. Delivery Sequence

1. Generate and approve the master character portrait.
2. Derive and optimize the aligned character states.
3. Implement the Neural Theatre frontend and deterministic memory index.
4. Implement and test the separate DeepSeek backend.
5. Connect frontend streaming to character states.
6. Run accessibility, responsive, performance, API, and visual QA.
7. Configure and verify the two Vercel projects when deployment credentials and the DeepSeek API key are available.
