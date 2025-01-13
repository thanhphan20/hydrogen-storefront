# Maker SixtyFour


# About the project
This project is a modern Shopify storefront built using the [Hydrogen framework](https://shopify.dev/docs/custom-storefronts/hydrogen). Hydrogen provides a React-based, server-rendered framework optimized for commerce, enabling fast and dynamic storefronts.

## Techstack

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher

## Project Structure

```plaintext
├── app/
│   ├── assets/          # Images, fonts, and other static assets specific to the app
│   ├── components/      # Reusable components
│   ├── graphql/         # GraphQL queries, mutations, and fragments
│   ├── lib/             # Library code and integrations (e.g., Shopify SDK, API utilities)
│   ├── routes/          # Page routes and dynamic route handlers
│   ├── styles/          # Global and module-specific styles
│   └── utils/           # Utility functions and helpers
├── public/              # Static assets served directly (e.g., robots.txt, favicon, etc.)
├── vite.config.js       # Vite configuration for the project
├── package.json         # Project dependencies and scripts
└── .env                 # Environment variables
```

## Installation

Install dependencies:
```bash
npm install
```
Start the development server:

```bash
npm run dev
```
The application will be available at http://localhost:3000

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

## License
This project is licensed under the MIT License.

## Resources
Shopify Hydrogen Documentation
Shopify Storefront API Reference
React Documentation
