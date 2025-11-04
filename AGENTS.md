# Agent Guidelines for Mocha Affirm

## Build/Test/Lint Commands

- **Dev server**: `npm run dev`
- **Build**: `npm run build` (runs TypeScript compilation + Vite build)
- **Lint**: `npm run lint`
- **Type check**: `tsc` (checks all TypeScript configs)
- **Full check**: `npm run check` (type check + build + dry-run deploy)
- **Cloudflare types**: `npm run cf-typegen`

## Code Style

### TypeScript

- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Use ES2020 target, ESNext modules
- Prefer explicit types for function params and returns; inference OK for simple variables
- Use `interface` for component props, object shapes

### Imports

- Use `@/*` path alias for imports from `src/` (e.g., `import { Affirmation } from '@/shared/types'`)
- Group imports: external packages first, then internal modules

### React/Components

- Use function components with TypeScript
- Use `forwardRef` for components exposing refs
- Props interfaces should extend relevant HTML element attributes when appropriate
- Use descriptive prop names with proper TypeScript types

### Naming

- Components: PascalCase (e.g., `Button.tsx`, `MoodTrackingModal.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAffirmations`, `useAudioPlayer`)
- Files: match component/hook name
- Interfaces: PascalCase, suffix with `Props` for component props

### Styling

- TailwindCSS for all styling
- Use descriptive variant-based props for component variations
- Gradient backgrounds and shadows are common in this project

### Error Handling

- Use try-catch blocks in async functions
- Log errors to console with descriptive messages
- Return fallback values (empty arrays, default objects) on errors

## TypeScript Strict Rules

- **NO `any` type**: Never use `any` type
- Always use specific types or `unknown` with proper type guards
- If a type is truly unknown, use `unknown` and validate with type guards before use
- Prefer explicit types over inference when clarity is important

## Code Quality Checks

- **Mandatory error checking after every code update**:
  - Run `read_lints` tool to check for linting errors
  - Run `tsc` to check for TypeScript compilation errors
  - If errors are found, fix them before proceeding
  - Never commit code with errors

## Git Workflow

- **Mandatory commit after every code update**:
  - After every working code update, commit with a clear message in English
  - Commit message should describe what was changed and why
  - Use descriptive commit messages following conventional commit format when possible

## MCP Tools Usage

- **Mandatory use of MCP tools for quality checks**:
  - Use `read_lints` tool after every code change to check for linting errors
  - Use other MCP tools as needed (testing, type checking, etc.)
  - MCP tools are required for validation - do not skip these checks
  - Always verify code quality using MCP tools before considering work complete
