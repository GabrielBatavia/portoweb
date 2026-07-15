# Gabriel — Neural Theatre Portfolio

A cinematic, recruiter-facing portfolio built around a near-photoreal Gabriel character, verified career evidence, and a streaming AI conversation. The repository is designed as two independent Vercel projects so the DeepSeek API key never reaches the browser.

## Project layout

- `/` — Vite frontend deployed to the frontend Vercel project.
- `/backend` — Node/Vercel API deployed as a second Vercel project.
- `/assets/character` — character states used by the frontend controller.
- `/public/Gabriel-Batavia-CV.pdf` — downloadable source CV.

## Run locally

```powershell
npm install
npm install --prefix backend
npm run dev
```

In a second terminal:

```powershell
npm run dev --prefix backend
```

The local backend starts in safe demo mode at `http://localhost:3001`; Vite starts at `http://localhost:5173`.

To test the real DeepSeek connection locally, set `DEEPSEEK_API_KEY`, set `DEMO_MODE=false`, then restart the backend. Keep the key out of the frontend environment.

## Deploy on two Vercel projects

### 1. Backend project

Import this repository and set **Root Directory** to `backend`. Add:

```text
DEEPSEEK_API_KEY=your_server_only_key
DEEPSEEK_MODEL=deepseek-v4-flash
DEMO_MODE=false
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

After deployment, verify `https://your-api.vercel.app/health`.

### 2. Frontend project

Import the same repository with the repository root as **Root Directory**. Add:

```text
VITE_API_BASE_URL=https://your-api.vercel.app
```

Redeploy the backend if the final frontend domain differs from the value in `ALLOWED_ORIGINS`.

## Quality checks

```powershell
npm run build
npm run check --prefix backend
npm test --prefix backend
```

The backend validates inputs, uses an exact CORS allow-list, keeps conversation history bounded, and streams stable `status`, `delta`, `done`, and `error` SSE events.
