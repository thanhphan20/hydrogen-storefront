# Hydrogen Headless Storefront

A high-performance, modern headless Shopify storefront built with **React Router 7**, **Hydrogen**, and **Tailwind CSS v4**.

This template is a production-ready "Skeleton" designed to be the ultimate starting point for bespoke Shopify storefronts. It prioritizes **Sub-second performance**, **Developer experience**, and **Accessibility** out of the box. Unlike traditional setups, it moves away from legacy Remix patterns in favor of the unified React Router 7 architecture, providing a more streamlined and powerful foundation for headless commerce.

## Features

- **React Router 7**: The successor to Remix, offering high-performance SSR, streaming, and a unified development model.
- **Hydrogen 2026.4.2**: Shopify's official toolkit, optimized for the Storefront API and global edge delivery.
- **Tailwind CSS v4**: A revolutionary, CSS-first engine that's faster and more capable, featuring built-in container queries and a modern configuration syntax.
- **Shadcn UI**: A collection of beautifully designed, accessible, and fully customizable components built on top of Radix UI primitives.
- **pnpm & Vite 8**: Blazing fast dependency management and HMR (Hot Module Replacement) for a frictionless developer workflow.
- **Oxygen & MiniOxygen**: Seamless local development and global deployment on Shopify's edge hosting platform.

## Folder Structure

```text
├── app/                  # Main application source
│   ├── components/       # Reusable UI components
│   │   └── ui/           # Shadcn UI (accessible primitives)
│   ├── graphql/          # Storefront API queries and fragments
│   ├── lib/              # Core business logic and shared utilities
│   ├── routes/           # File-based routing (React Router 7)
│   ├── styles/           # Global CSS and Tailwind design tokens
│   ├── root.tsx          # Root layout and application entry
│   └── entry.server.tsx  # Server-side entry point
├── public/               # Static assets (images, fonts, etc.)
├── server.ts             # Oxygen/MiniOxygen server entry
├── vite.config.ts        # Vite build and plugin configuration
└── package.json          # Project dependencies and scripts
```

## Quick Start

Get your development environment up and running in less than 5 minutes.

**Requirements:**
- Node.js `^22` or `^24`
- [pnpm](https://pnpm.io/) `^9`

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

## Configuration

The project uses environment variables for configuration. Create a `.env` file based on `.env.example`.

| Variable | Description |
|----------|-------------|
| `PUBLIC_STORE_DOMAIN` | Your Shopify store domain (e.g., `store.myshopify.com`) |
| `PUBLIC_STOREFRONT_API_TOKEN` | Public access token for the Storefront API |
| `PRIVATE_STOREFRONT_API_TOKEN` | Private access token (required for server-side requests) |
| `SESSION_SECRET` | Secret key for session encryption |

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Starts the development server with automatic codegen |
| `pnpm build` | Compiles the application for production |
| `pnpm preview` | Boots a local production preview environment |
| `pnpm codegen` | Synchronizes GraphQL types from your `.graphql` files |
| `pnpm lint` | Performs static analysis for code quality |
| `pnpm typecheck` | Validates TypeScript types across the project |

## Documentation

- [Hydrogen Docs](https://shopify.dev/custom-storefronts/hydrogen)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [Shadcn UI Docs](https://ui.shadcn.com/)

## License

This project is licensed under the MIT License.
