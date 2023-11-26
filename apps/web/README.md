<div align="center">
  <img alt="Logo" src="./public/favicon.svg" width="75" height="75">
  <h1>Rent House ( Client )</h3>
</div>

Welcome to the frontend repository for Rent House Project ! This project is built with React 18. Wish you the best of luck as you contribute to the project. 💪

### Table of Contents

1. [Development Setup](#1-development-setup)
2. [Folder structure](#2-folder-structure)
3. [External Libraries Used](#3-external-libraries-used)
4. [More Info](#4-more-info)

### 1. Development Setup

To get started with the project, follow these steps:

1. Clone the repository.
2. Install the project dependencies using `bun install`.
3. Set up git pre-commit hooks using `bun prepare`.

Once you have completed the initial setup, you can use the following commands to work on the project:

- `bun dev` - Starts the development server.
- `bun build` - Builds the production-ready assets.
- `bun preview` - Previews the production build locally.

Please note that this project uses `bun` as the package manager. It is recommended to use `bun` for installing and managing dependencies.

Additionally, pre-commit hooks have been set up using [husky](https://typicode.github.io/husky/#/), which runs type checking and code formatting with [prettier](https://prettier.io/) before committing code changes. It is recommended to leave these hooks enabled, but if necessary, you can bypass them by running `git commit` with the `--no-verify` flag.

If you have any questions or issues with the development setup, please contact the project lead for assistance.

### 2. Folder structure

```
┌── public                   # contains public assets
│   └── ...
└── src
    ├── App.tsx              # main application component
    ├── assets               # contains images, stylesheets, etc.
    ├── components           # contains reusable UI components
    ├── context              # contains application contexts
    ├── pages                # contains pages and dashboards
    │   └── ...
    ├── types                # contains TypeScript types
    └── utils                # contains utility functions and hooks

```

### 3. External Libraries Used (Major)

The following external libraries were used in this project.<br /> Please note that blindly installing new packages can increase the size of the application and may cause compatibility issues. For example, adding `Tailwind CSS` to this project may break the application because it is not very well compatible with `Mantine`.

- **@mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications** - handling application UI
- **react-router-dom** - client-side routing
- **axios** - handling network requests
- **@tanstack/react-query** - caching server state
- **react-icons** - icons
- **react-hook-form** - building and validating forms
- **dayjs** - parsing, validating, manipulating, and formatting dates
- **lodash** - easy utilities
- **ts-toolbelt** - TypeScript utility types

### 4. More Info

For more information and documentation, please refer to the appropriate folders and files within the project directory. Some components or libraries may have their own README files or documentation within their respective folders. Keep in mind that not all folders may contain a README file.

<div align="center">
  <h3><b>👋 &nbsp; Good luck! &nbsp; 🎉</b></h3>
</div>
