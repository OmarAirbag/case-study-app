# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Firebase Functions
- `cd functions && npm run build` - Build functions
- `cd functions && npm run lint` - Lint functions code
- `cd functions && npm run serve` - Start local emulator
- `firebase deploy --only functions` - Deploy functions

### Firebase Services
- `firebase emulators:start` - Start all Firebase emulators locally
- `firebase deploy` - Deploy all services (hosting, functions, firestore)

## Architecture Overview

This is a Next.js 15 application with Firebase backend for a case study generator. The app uses:

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **UI**: Tailwind CSS v4, Radix UI components, Lucide React icons
- **State**: Zustand for client state management, React Hook Form for forms
- **Backend**: Firebase (Firestore, Functions, Storage, Analytics)
- **Deployment**: Firebase Hosting + Functions

### Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/ui/` - Reusable UI components
- `/src/components/wizard/` - Case study creation wizard components
- `/src/lib/firebase.ts` - Firebase client configuration
- `/src/types/case-study.ts` - TypeScript interfaces for case study data
- `/functions/` - Firebase Cloud Functions (Node.js 22)

### Key Data Model
The main entity is `CaseStudy` (defined in `src/types/case-study.ts`) which contains:
- 6-step wizard form data (project info, situation, approach, team, results, media)
- Status tracking (draft/published)
- User association and timestamps
- Flexible budget visibility options
- Rich media support (images, testimonials)

### Firebase Configuration
- Project ID: `ascasestudiesgenerator`
- Firestore: European region (eur3)
- Functions require Node.js 22
- Uses Firebase v9+ modular SDK

### Path Aliases
- `@/*` maps to `./src/*` for clean imports