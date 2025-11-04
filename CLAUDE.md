# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mocha Affirm is a personalized affirmation app built with React + Vite, deployed on Cloudflare Workers. Users complete an onboarding flow (tutorials → signup → preference questions → voice setup) before accessing the main app where they can generate AI-powered affirmations, play them with custom voice recordings, and manage favorites.

## Development Commands

- **Dev server**: `npm run dev` - Starts Vite dev server with Cloudflare Workers integration
- **Build**: `npm run build` - Compiles TypeScript and builds with Vite
- **Lint**: `npm run lint` - Runs ESLint
- **Type check**: `npm run check` - Full check: type check + build + dry-run Cloudflare deploy
- **Generate Cloudflare types**: `npm run cf-typegen` - Generates types for Cloudflare Workers bindings

## Architecture

### Tech Stack
- **Frontend**: React 19, React Router 7, TailwindCSS, Lucide icons
- **Backend**: Hono (serverless framework) running on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 for user voice recordings
- **AI**: OpenAI GPT-4o-mini for affirmation generation
- **TTS**: Google Cloud Text-to-Speech API for voice synthesis
- **Build**: Vite 7 with Cloudflare plugin
- **Validation**: Zod schemas

### Project Structure

```
src/
├── react-app/          # Frontend React application
│   ├── App.tsx         # Router setup with all routes
│   ├── main.tsx        # React entry point
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks for API interactions
│   └── pages/          # Route pages (Splash, Tutorial*, Questions*, Home, Player, etc.)
├── shared/
│   └── types.ts        # Shared Zod schemas and TypeScript types
└── worker/
    └── index.ts        # Hono API server (Cloudflare Worker entry point)
```

### Key Architectural Patterns

**1. API Layer (worker/index.ts)**
- Hono app handles all API routes under `/api/*`
- Accesses Cloudflare bindings via `c.env` (DB, R2_BUCKET, OPENAI_API_KEY)
- All routes use try-catch with consistent error response format: `{ success: false, error: string }`

**2. Data Flow**
- React hooks (`useAffirmations`, `useProfile`, `useFavorites`, etc.) encapsulate API calls
- Hooks manage local state and provide methods to components
- Shared types defined in `src/shared/types.ts` using Zod schemas
- Mock user ID `'user_123'` used throughout (no auth implemented yet)

**3. Database Schema**
- `users`: Basic user info, onboarding status, premium flag
- `user_preferences`: Focus areas (JSON array), emotional state, tone, language, style
- `affirmations`: User's generated affirmations with metadata
- `mood_tracking`: Before/after mood tracking linked to affirmations
- `user_voices`: Voice recordings stored in R2, one active voice per user

**4. User Flow**
- Onboarding: `/` → `/tutorial/1-3` → `/signup` → `/questions/1-4` → `/voice-setup` → `/home`
- Main app: `/home` (generate affirmations) → `/player` (play with voice) → `/favorites` (manage favorites)
- Bottom navigation on main pages: Home, Player, Favorites, Settings

**5. AI Integration**
- Affirmation generation: POST to `/api/affirmations/generate` with user preferences
- Uses OpenAI GPT-4o-mini with structured prompt including focus areas, emotional state, tone, language, and style
- Returns exactly 5 affirmations, saved to DB immediately after generation
- Audio generation: Google Cloud Text-to-Speech API automatically generates MP3 audio for each affirmation
- Audio files stored in R2 at `affirmations/{userId}/{affirmationId}.mp3`
- Audio served via `/api/affirmations/:id/audio` endpoint

**6. Voice System**
- Demo voices: 5 predefined voices (Sarah, Alex, Maya, James, Luna) with Google TTS Neural2 voices
- Voice preview: Users can preview demo voices via `/api/text-to-speech/preview` endpoint
- Custom voices: Users record/upload voice samples during onboarding
- Files stored in R2 at `user-voices/{userId}/{timestamp}.{ext}`
- Only one active voice per user (enforced by updating `is_active` flag)
- Voice playback fetched via `/api/user-voices/:id/audio`
- Affirmation audio: Generated using selected voice (demo or custom) and stored in R2

### Import Path Alias
- Use `@/*` for all imports from `src/` (e.g., `import { Affirmation } from '@/shared/types'`)
- Configured in `vite.config.ts` and all TypeScript configs

### Environment Bindings
The Cloudflare Worker expects these bindings (configured in `wrangler.json`):
- `DB`: D1 database binding
- `R2_BUCKET`: R2 bucket for voice storage
- `OPENAI_API_KEY`: OpenAI API key (set in Cloudflare dashboard)
- `GOOGLE_CLOUD_API_KEY`: Google Cloud API key for Text-to-Speech (set in Cloudflare dashboard)

**Local Development Setup:**
- Create a `.dev.vars` file in the project root with your API keys:
  ```
  OPENAI_API_KEY=your-openai-api-key-here
  GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key-here
  ```
- The `.dev.vars` file is automatically loaded by Wrangler during local development
- This file should be in `.gitignore` to prevent committing secrets
- See `.env.example` for a template

**Google Cloud TTS Setup:**
- Enable the Text-to-Speech API in your Google Cloud Console
- Create an API key with Text-to-Speech API permissions
- Add the API key to `.dev.vars` for local development
- Add the API key as a secret in Cloudflare Workers dashboard for production

### Database Migrations
- Located in `migrations/` directory
- `1.sql`: Core tables (users, preferences, affirmations, mood_tracking)
- `2.sql`: User voices table
- Apply migrations: `wrangler d1 migrations apply <database-name>`

### Styling
- TailwindCSS for all styling (no CSS modules or styled-components)
- `GradientBackground.tsx` component provides consistent gradient backgrounds
- Mobile-first design with fixed bottom navigation on main pages

## Development Guidelines

### TypeScript Strict Rules
- **NO `any` type**: Never use `any` type - this is strictly prohibited
- Always use specific types or `unknown` with proper type guards
- If a type is truly unknown, use `unknown` and validate with type guards before use
- Prefer explicit types over inference when clarity is important

### Code Quality Checks
- **Mandatory error checking after every code update**:
  - Run `read_lints` tool to check for linting errors after every code change
  - Run `tsc` to check for TypeScript compilation errors
  - If errors are found, fix them before proceeding
  - Never commit code with errors

### Git Workflow
- **Mandatory commit after every code update**:
  - After every working code update, commit with a clear message in English
  - Commit message should describe what was changed and why
  - Use descriptive commit messages following conventional commit format when possible

### MCP Tools Usage
- **Mandatory use of MCP tools for quality checks**:
  - Use `read_lints` tool after every code change to check for linting errors
  - Use other MCP tools as needed (testing, type checking, etc.)
  - MCP tools are required for validation - do not skip these checks
  - Always verify code quality using MCP tools before considering work complete
