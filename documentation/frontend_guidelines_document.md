# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies for the CodeGuide Starter Kit–based dashboard and admin panel application. It’s written in clear, everyday language so anyone can understand how the frontend is set up, maintained, and extended.

## 1. Frontend Architecture

### Overview
- **Framework:** Next.js 15 (App Router) with TypeScript.
- **UI Library:** shadcn/ui component library built on top of Tailwind CSS v4.
- **Authentication:** Clerk for sign-up, sign-in, and role management.
- **Database Layer:** Prisma client (PostgreSQL) for all data operations.
- **Theming:** `next-themes` for light/dark mode support.

### Scalability, Maintainability, Performance
- **File-Based Routing (App Router):** New pages and API routes are added by simply creating files and folders under `src/app`. This structure grows naturally as features expand.
- **Server Components:** By default, data fetching and heavy logic live on the server. This reduces bundle size in the browser and speeds up initial page loads.
- **Centralized Services:** A single `src/lib/prisma.ts` initializes the Prisma client, and utility files (like `src/lib/weather.ts`) live alongside. This avoids duplication and makes updates easy.
- **Dev Container:** A Docker-based development environment ensures every developer uses the same Node, Yarn, and tooling versions, preventing "works on my machine" issues.

## 2. Design Principles

### Usability
- Clear, minimal layouts.
- Consistent navigation patterns across public and admin sections.
- Form labels, placeholders, and inline validation messages.

### Accessibility
- Semantic HTML tags (e.g., `<button>`, `<nav>`, `<main>`).
- ARIA attributes where needed (e.g., `aria-label`, `role="alert"`).
- Color contrast meeting WCAG AA standards.

### Responsiveness
- Mobile-first design using Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`).
- Flexible grid and flexbox layouts that adapt to screen size.

Application of Principles
- All shadcn/ui components are extended with Tailwind classes to ensure they behave well at different screen widths.
- Focus states and keyboard navigation are tested across forms and menus.

## 3. Styling and Theming

### Styling Approach
- **Utility-First CSS:** Tailwind CSS v4 is used for styling, enabling rapid design adjustments via class names.
- **Component Styles:** Reusable styles are wrapped in shadcn/ui components. If a specific tweak is needed, extend using Tailwind’s `@apply` or custom classes in a central `globals.css`.

### CSS Methodology
- No BEM or SMACSS. Instead, Tailwind’s atomic utility classes keep selectors simple and scoped to components.
- Custom component classes (e.g., `.btn-primary`, `.card-glass`) are defined in `globals.css` when a style repeats across the app.

### Theming
- **Dark/Light Toggle:** Managed by `next-themes`. The `<ThemeProvider>` in `src/app/layout.tsx` wraps the app and reads/writes user preference to localStorage.
- **Tailwind Config:** `tailwind.config.js` enables `darkMode: ['class']`, letting us switch with a `class="dark"` on `<html>`.

### Style & Look-and-Feel
- **Style:** Futuristic-minimal dark theme with glassmorphic accents.
- **Glassmorphism:** Semi-transparent card backgrounds with subtle backdrop blur (`backdrop-blur-lg`) and soft shadows.
- **Modern & Flat:** Clean edges, minimal borders, neon accent glows.

### Color Palette
- **Background (Dark):** #0F0F0F
- **Surface (Cards):** #1A1A1A (opacity 60% + blur)
- **Primary (Neon Blue):** #00DFFD
- **Secondary (Neon Purple):** #C400FF
- **Accent (Highlight):** #FF4D4D
- **Text (Light):** #E0E0E0
- **Text (Dark Mode Subtle):** #B0B0B0

### Fonts
- **Primary Font:** Inter (sans-serif) for readability and modern feel.
- **Fallbacks:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'`.

## 4. Component Structure

### Organization
- **src/components/ui/**: Reusable UI building blocks (Button, Card, Table, Form inputs).
- **src/app/**: Page folders with their own `layout.tsx` and `page.tsx` for public and admin sections.
- **src/app/admin/**: Contains all admin panel pages and nested layouts.

### Reuse and Maintenance
- Each component is self-contained: style, markup, and minimal internal logic.
- Shared utilities (e.g., date formatters) live in `src/lib` rather than inside components.
- Component-based architecture means fixing or updating a UI pattern in one place updates it everywhere.

## 5. State Management

### Approach
- **Server State:** Fetched in React Server Components or via built-in Next.js data fetching (`fetch()` in server code).
- **Client State:** Handled locally within React components using `useState` and `useEffect`.

### Advanced Scenarios
- For complex admin forms and list interactions, we recommend **Zustand** or **Jotai**:
  - Keeps form state decoupled from UI.
  - Simplifies data sharing between far-apart components (e.g., a filter panel and a table).

## 6. Routing and Navigation

### Routing
- **File-Based Routes:** All page routes correspond to files under `src/app`:
  - `/` → `src/app/page.tsx`
  - `/admin` → `src/app/admin/page.tsx`
  - Nested admin pages like `/admin/todos/[id]/edit` under `src/app/admin/(todos)/[id]/edit.tsx`.

### Navigation
- **Next.js Link Component:** Use `<Link href="/path">` for client-side transitions.
- **Protected Routes:** Middleware in `src/middleware.ts` intercepts `/admin` paths and checks Clerk session claims (`role === 'admin'`). Unauthorized users get redirected.

## 7. Performance Optimization

- **Server Components & SSR:** Minimizes client bundle size by keeping data-fetching logic on the server.
- **Code Splitting:** Automatic with Next.js App Router. Heavy components (e.g., charts) can be loaded with dynamic imports (`next/dynamic`).
- **Lazy Loading:** Images use `<Image src=... priority={false}>` and `loading="lazy"`. Non-critical components can be wrapped in `dynamic()`.
- **Asset Optimization:** Tailwind CSS is purged for unused classes at build time. Static assets (SVGs, fonts) are served from Next.js’s optimized pipeline.

## 8. Testing and Quality Assurance

### Unit and Integration Tests
- **Jest** with **React Testing Library**:
  - Test individual components (buttons, forms) for rendering and interactions.
  - Mock Prisma client calls in API route tests.

### End-to-End Tests
- **Playwright** or **Cypress**:
  - Verify public dashboard loads all sections (< 2s).
  - Confirm unauthorized users cannot access `/admin`.
  - Full CRUD cycles for `TodoTask` and `CompanyNews`.

### Linters and Formatters
- **ESLint:** Enforces code style and catches errors early.
- **Prettier:** Auto-formats code on save.

### Continuous Integration
- GitHub Actions runs lint, type-check, test suites, and builds preview deployments on each pull request.

## 9. Conclusion and Overall Frontend Summary

This frontend is built on a modern Next.js App Router foundation, TypeScript, and the utility-first power of Tailwind CSS. Authentication via Clerk and database operations through Prisma ensure secure and maintainable data flows. A futuristic-minimal dark theme, managed by `next-themes`, paired with shadcn/ui components, delivers a polished user experience. Component-based design, server components, and strategic performance optimizations combine to meet our <2s load time goal. Finally, comprehensive testing and a consistent development environment guarantee reliability and ease of collaboration. 

With this guideline in hand, anyone can step into the project and understand how the pieces fit together, extend functionality, and uphold the high standards we’ve set for usability, accessibility, and performance.