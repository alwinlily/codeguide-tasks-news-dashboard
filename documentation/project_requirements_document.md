# Project Requirements Document (PRD)

## 1. Project Overview

CodeGuide Tasks & News Dashboard is a modern web application built on a Next.js starter template. It delivers a public-facing dashboard that displays to-do tasks, urgent items, company news, and live weather data. Behind the scenes, it also provides a protected admin panel where authorized users can manage those tasks and news items through full create, read, update, and delete (CRUD) operations.

We’re building this project to streamline both general user engagement and internal content management. The public dashboard solves the problem of scattered information by consolidating key updates and utilities (like weather and urgent tasks) in one place. The admin panel solves the problem of manual database edits by giving administrators an intuitive UI to manage content. Success will be measured by fast page loads (under 2 seconds), secure authentication and authorization, and clean, responsive interfaces that match our futuristic-minimal dark theme.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1)**
• User authentication (sign-up / sign-in) via Clerk, with role-based access control (user vs. admin).
• Public dashboard showing:
  - To-do tasks (with priority highlight for urgent items).
  - Company news feed.
  - Live weather information fetched from OpenWeatherMap.
• Admin panel (protected under `/admin/*`) featuring:
  - List, create, edit, and delete operations for `TodoTask` and `CompanyNews` entries via intuitive forms and tables.
  - Middleware enforcement so only users with `role = admin` can access these routes.
• API layer under `src/app/api`: RESTful endpoints for `/todos`, `/urgent`, `/news`, and `/weather`.
• Database integration using PostgreSQL managed by Prisma (type-safe ORM). Models defined in `schema.prisma`.
• Frontend built with Next.js (App Router), TypeScript, Tailwind CSS v4, and shadcn/ui components.
• Theme support with `next-themes` (light/dark mode toggling).
• Development environment consistency via Dev Containers.

**Out-of-Scope (v1)**
• AI chat interface and Vercel AI SDK integration (optional, can be removed).
• Additional third-party integrations (e.g., email notifications, analytics, payment gateways).
• Mobile-specific layouts or native apps.
• Advanced data export or reporting features.
• Multi-language support.

## 3. User Flow

A general visitor lands on the public dashboard (root `/`). They see a top bar with sign-in/sign-up links (powered by Clerk). Once signed in as a regular user, they can view sections for “To-Do Tasks,” “Urgent Tasks,” “Company News,” and “Weather.” Each section fetches data from its respective API route on page load. The data is presented in cards or lists styled with Tailwind CSS and shadcn/ui. Users can toggle between light and dark modes via a global theme switcher.

An administrator signs in through the same Clerk flow, but now the admin role is stored in their session metadata. After authentication, they click an “Admin Panel” link in the navigation. They land on `/admin`, which shows a sidebar with links to “Manage Tasks” and “Manage News.” Each page displays a data table listing existing items and buttons to “Create New,” “Edit,” or “Delete.” Clicking “Create” or “Edit” opens a form component using shadcn/ui inputs. Upon submission, the form validates input with Zod, calls the appropriate API route (e.g., `POST /api/todos`), and then refreshes the list.

## 4. Core Features

• Authentication & Authorization:
  - Clerk-powered sign-up/sign-in.
  - Middleware checks `auth().sessionClaims.metadata.role` for `admin`.
• Public Dashboard:
  - `/api/todos` (GET all tasks).
  - `/api/urgent` (GET tasks flagged as urgent).
  - `/api/news` (GET company news).
  - `/api/weather` (GET live weather data from OpenWeatherMap).
• Admin CRUD Interfaces:
  - Data tables with pagination and sorting.
  - Forms for creating/editing `TodoTask` and `CompanyNews`.
  - Zod schema validation on API routes.
• Theming & UI:
  - Tailwind CSS v4 utility-first styling.
  - shadcn/ui prebuilt components (Table, Card, Input, Button, Form).
  - next-themes for light/dark mode management.
• Backend & Data Layer:
  - Next.js App Router for server and client components.
  - Prisma ORM for PostgreSQL (models in `prisma/schema.prisma`).
  - Singleton Prisma client exported from `src/lib/prisma.ts`.
• Development Environment:
  - Dev Container configuration (.devcontainer).
  - Optional: Zustand or Jotai for client-side state in admin forms.
• Testing & Quality:
  - Jest + React Testing Library for unit/component tests.
  - Playwright or Cypress for end-to-end testing.
  - Comprehensive error handling in API routes.

## 5. Tech Stack & Tools

• Frontend:
  - Next.js (v15 App Router) with TypeScript.
  - Tailwind CSS v4 for styling.
  - shadcn/ui component library.
  - next-themes for theme toggling.
  - React Testing Library & Jest for unit tests.
  - Playwright or Cypress for E2E tests.
• Backend & API:
  - Next.js serverless API routes.
  - Prisma ORM (`@prisma/client`) with PostgreSQL.
  - Zod for request validation.
  - OpenWeatherMap API for weather data (external HTTP call in `src/lib/weather.ts`).
• Authentication & Authorization:
  - Clerk for user management.
  - Next.js middleware for role-based route protection.
• Dev Environment:
  - Dev Containers (Docker-based) for consistent setups.
  - VS Code with Cursor or Windsurf plugins (optional).

## 6. Non-Functional Requirements

• Performance:
  - Public dashboard initial load ≤ 2 seconds (Server-Side Rendering).
  - API response times ≤ 200ms for CRUD operations.
• Security:
  - All routes under `/admin` return 401/403 if unauthorized.
  - HTTPS enforcement in production.
  - Input sanitization and validation (Zod).
• Usability & Accessibility:
  - WCAG 2.1 AA compliance for color contrast and keyboard navigation.
  - Responsive design for desktop and tablet breakpoints.
• Reliability & Scalability:
  - 99.9% uptime SLA for API.
  - Database connection pooling with Prisma.
• Maintainability:
  - 80%+ code coverage on tests.
  - Linting (ESLint) and formatting (Prettier) rules.

## 7. Constraints & Assumptions

• Node.js v18+ environment with Docker support for Dev Containers.
• PostgreSQL database accessible in both dev and prod.
• Supplier of OpenWeatherMap API key and Clerk project credentials.
• Assumes every admin user has `metadata.role = 'admin'` set in Clerk.
• API rate limits from OpenWeatherMap may require caching or throttling.

## 8. Known Issues & Potential Pitfalls

• **Database Migration Switch**: Removing Supabase and implementing Prisma migrations can introduce sync issues. Mitigation: Run Prisma migrate in a separate branch and verify schema.
• **API Rate Limits**: Weather endpoint might exceed daily limits under heavy load. Mitigation: Cache responses in memory or a Redis layer for 10–15 minutes.
• **Middleware Complexity**: Role checks in middleware must align with Clerk session claims structure. Mitigation: Write unit tests covering unauthorized and authorized scenarios.
• **Error Handling Gaps**: Uncaught exceptions in API routes can leak stack traces. Mitigation: Global error handler wrapper that logs errors and returns sanitized responses.
• **Component State**: Admin forms managing complex state may get messy. Mitigation: Use a lightweight state library (Zustand/Jotai) and break forms into smaller subcomponents.

---
This document provides a clear, step-by-step guide for an AI model (or any developer) to implement the CodeGuide Tasks & News Dashboard from the ground up, with no ambiguities about what needs to be built and how each piece fits together.