# Tech Stack Document

This document outlines the technology choices for our Dashboard & Admin Panel application, explaining each component in everyday language so everyone can grasp why and how we use them.

## Frontend Technologies

- **Next.js 15 (App Router)**
  - Provides a fast, organized way to build pages and components.
  - Lets us use Server Components to fetch data on the server for speedy page loads.
- **TypeScript**
  - Adds type checks, catching errors early and making the code easier to understand.
- **Tailwind CSS v4**
  - A utility-first styling tool that speeds up design work.
  - Perfect for creating our "futuristic-minimal" dark theme without writing custom CSS from scratch.
- **shadcn/ui**
  - A library of ready-made UI components (tables, cards, inputs, buttons) that fit our design style.
  - Helps maintain a consistent look and feel across the app.
- **next-themes**
  - Handles switching between light and dark modes seamlessly.
  - Wraps the app in a ThemeProvider so all components adapt automatically.
- **Optional State Management (Zustand or Jotai)**
  - Keeps track of form inputs, loading states, and success messages in the admin interface.
  - Helps us avoid prop-drilling and keeps component logic clean.

## Backend Technologies

- **Node.js with Next.js API Routes**
  - Enables serverless-style functions within our app (`/api/todos`, `/api/news`, etc.).
  - Handles CRUD operations and external API calls without a separate server.
- **Prisma**
  - Acts as our bridge to the PostgreSQL database.
  - Provides a typed client to create, read, update, and delete data safely.
- **PostgreSQL**
  - A reliable, open-source relational database to store tasks and company news.
- **Zod**
  - Validates incoming request data in our API routes.
  - Ensures only well-formed data reaches our database, reducing errors.
- **OpenWeatherMap API**
  - A third-party service we call from the `/api/weather` route.
  - Supplies live weather data for our dashboard.

## Infrastructure and Deployment

- **Git & GitHub**
  - Version control system to track code changes and collaborate safely.
- **Dev Containers**
  - Docker-based development environments.
  - Ensures every developer has the same setup, avoiding "it works on my machine" issues.
- **CI/CD (GitHub Actions)**
  - Automatically runs tests and linters on every pull request.
  - Deploys the app when changes merge to the main branch, keeping our live site up-to-date.
- **Vercel (Recommended Hosting)**
  - Native support for Next.js apps with zero-config deployments.
  - Provides global edge caching for ultra-fast page loads.
- **Environment Variables**
  - Securely store keys and secrets (e.g., database URL, Clerk keys, OpenWeatherMap API key).
  - Prevent sensitive data from leaking into the codebase.

## Third-Party Integrations

- **Clerk for Authentication**
  - Pre-built sign-up, sign-in, and session management.
  - Middleware protects admin routes by checking a user’s `role` claim.
- **OpenWeatherMap**
  - Supplies weather data that we display on the public dashboard.
- **Vercel AI SDK (Optional)**
  - Provides a chat interface if you want AI-powered features.
  - Can be removed if not needed, as it’s not core to our project.

## Security and Performance Considerations

- **Authentication & Authorization**
  - Clerk middleware restricts `/admin/*` routes to users with the `admin` role.
  - API routes include checks to ensure only admins can create, update, or delete data.
- **Data Validation**
  - Zod schemas validate every API request, preventing bad or malicious data.
- **Error Handling**
  - `try…catch` blocks in API routes return clear status codes (400, 401, 404, 500).
  - Meaningful error messages help both developers and users understand what went wrong.
- **Performance Optimizations**
  - Server Components in Next.js fetch all necessary data on the server, reducing client-side JavaScript.
  - Parallel data fetching ensures multiple API calls (todos, news, weather) happen at the same time.
  - Edge caching (via Vercel) serves static or rarely changing content lightning-fast.

## Conclusion and Overall Tech Stack Summary

We chose this combination of tools to match our goal: a secure, fast, and visually appealing web application with both a public dashboard and a protected admin panel. Here’s how everything fits together:

- Next.js with the App Router and Server Components ensures speedy page loads and clear code organization.
- TypeScript, Prisma, and Zod give us type safety and data validation from front to back.
- Tailwind CSS, shadcn/ui, and next-themes deliver a polished, consistent user interface with minimal effort.
- Clerk handles authentication out of the box, while our middleware enforces role-based access control.
- A PostgreSQL database stores our core data, accessed through Prisma for easy migrations and queries.
- GitHub Actions and Dev Containers streamline development, testing, and deployment.
- Third-party services like OpenWeatherMap and optional Vercel AI add dynamic features without reinventing the wheel.

This stack offers a solid foundation that’s easy to understand, maintain, and grow. Should we need more advanced features—like real-time updates or analytics—we can layer them on top without disrupting our core architecture.

Happy coding!