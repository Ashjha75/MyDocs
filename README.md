# MyDocs: Multi-Stack Documentation & Knowledge Hub

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

> **MyDocs** is a comprehensive documentation and learning platform, combining guides, code snippets, and best practices for modern web and backend development. It leverages **Astro** and **Starlight** for static site generation, and covers:
>
>- **Frontend**: Angular, TypeScript, CSS, UI/UX, state management
>- **Backend**: Spring Boot, JPA, Security, Testing, REST APIs
>- **DevOps**: Docker, CI/CD, MySQL, Redis
>- **AI & Prompt Engineering**: Gemini, LangChain, context-driven docs
>
> The project is organized in layered modules for scalable, maintainable, and production-ready systems. Ideal for developers, students, and teams seeking reference-quality docs and real-world code patterns.

## 🚀 Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro documentation](https://docs.astro.build), or jump into the [Astro Discord server](https://astro.build/chat).
