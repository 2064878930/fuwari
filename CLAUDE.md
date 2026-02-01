# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fuwari is a static blog template built with **Astro 5**, **Svelte 5**, and **Tailwind CSS**. Deployed at https://blog.dl-am.cn/.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start local dev server at `localhost:4321` |
| `pnpm build` | Build to `dist/` and generate Pagefind search index |
| `pnpm preview` | Preview the build locally |
| `pnpm check` | Run Astro check for errors |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm format` | Format code with Biome (writes to files) |
| `pnpm lint` | Lint code with Biome (writes fixes) |
| `pnpm new-post <filename>` | Generate a new blog post |

## Architecture

- **Framework**: Astro 5 with static site generation
- **UI Components**: Svelte 5 components in `src/components/`
- **Routing**: File-based routing via `src/pages/`
- **Layouts**: Page layouts in `src/layouts/`
- **Content**: Markdown blog posts in `src/content/posts/`
- **Configuration**: Site config in `src/config.ts`, Astro config in `astro.config.mjs`
- **Styling**: Tailwind CSS + Stylus, global styles in `src/styles/`
- **Path Aliases**: `@components/*`, `@utils/*` mapped in `tsconfig.json`

## Code Style

- **Formatter/Linter**: Biome (configured in `biome.json`)
  - Tab indentation
  - Double quotes for JavaScript/TypeScript
  - Run `pnpm format` and `pnpm lint` before committing
- **Commits**: Use Conventional Commits (`feat:`, `fix:`, `chore:`)

## Blog Posts

- Location: `src/content/posts/`
- Filename convention: lowercase with hyphens (e.g., `my-first-post.md`)
- Frontmatter template:
  ```yaml
  ---
  title: My First Blog Post
  published: 2023-09-09
  description: Description here
  image: ./cover.jpg
  tags: [Foo, Bar]
  category: Front-end
  draft: false
  lang: jp  # optional, set only if differs from site language
  ---
  ```
