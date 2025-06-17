# Case Study Generator

A Next.js 15 application with Firebase backend for creating and managing case studies.

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **UI**: Tailwind CSS v4, Radix UI components, Lucide React icons
- **State**: Zustand for client state management, React Hook Form for forms
- **Backend**: Firebase (Firestore, Functions, Storage, Analytics)
- **Deployment**: Firebase Hosting + Functions

## Getting Started

### Prerequisites
- Node.js 18+ (Functions require Node.js 22)
- Firebase CLI installed globally: `npm install -g firebase-tools`

### Development Setup

1. Install dependencies:
```bash
npm install
cd functions && npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Start Firebase emulators (optional):
```bash
firebase emulators:start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

### Frontend
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

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── preview/         # Case study preview pages
│   │   ├── signin/          # Authentication page
│   │   └── wizard/          # Case study creation wizard
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   └── wizard/          # Wizard-specific components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and services
│   │   ├── templates/       # Case study templates
│   │   └── firebase.ts      # Firebase configuration
│   ├── store/               # Zustand state stores
│   └── types/               # TypeScript type definitions
├── functions/               # Firebase Cloud Functions
│   └── src/
│       └── index.ts         # Functions entry point
└── public/                  # Static assets
```

## Firebase Configuration

- **Project ID**: `ascasestudiesgenerator`
- **Firestore**: European region (eur3)
- **Functions**: Node.js 22 runtime
- **SDK**: Firebase v9+ modular SDK

## Features

- **Case Study Wizard**: 6-step form for creating comprehensive case studies
- **Real-time Collaboration**: Multiple users can work on case studies
- **Rich Media Support**: Upload and manage images, testimonials
- **Export Options**: Generate PDFs and other formats
- **Organization Management**: Multi-tenant support for teams
- **Authentication**: Firebase Auth integration

## Development

The application uses TypeScript throughout with strict type checking. Path aliases are configured with `@/*` mapping to `./src/*` for clean imports.

For detailed development instructions, see [CLAUDE.md](./CLAUDE.md).
