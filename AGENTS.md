# Repository Guidelines

## Project Structure & Module Organization
- `src/pages` 放页面路由，`src/layouts` 管理布局，`src/components` 为可复用组件。
- 内容与文章在 `src/content/posts`，资源在 `src/assets`，全局样式在 `src/styles`。
- 公开静态资源放 `public`，脚本工具放 `scripts`（如 `scripts/new-post.js`），说明文档在 `docs`。

## Build, Test, and Development Commands
- `pnpm dev` 本地开发（默认 `http://localhost:4321`）。
- `pnpm build` 构建到 `dist`，并运行 `pagefind` 生成搜索索引。
- `pnpm preview` 预览构建结果，`pnpm check` 运行 Astro 检查。
- `pnpm type-check` 运行 TypeScript 类型检查；`pnpm new-post <name>` 生成新文章模板。

## Coding Style & Naming Conventions
- 使用 Biome 统一格式化与 lint：`pnpm format`、`pnpm lint`（仅处理 `src`）。
- 缩进为 Tab，JavaScript/TypeScript 统一双引号（见 `biome.json`）。
- 建议文章文件名用小写短横线，如 `my-first-post.md`，Frontmatter 字段遵循 `docs` 与 README 示例。

## Testing Guidelines
- 当前未发现独立测试框架或测试目录；以 `pnpm check`、`pnpm type-check` 作为基础质量门槛。
- 若新增测试，请在 PR 中说明框架与运行方式，并补充到本节。

## Commit & Pull Request Guidelines
- 项目历史中既有中文简短提交，也有 Conventional Commits（如 `chore(deps): ...`）。
- 参考 `CONTRIBUTING.md`，优先使用 Conventional Commits：`feat: ...`、`fix: ...`、`chore: ...`。
- PR 保持单一目的，描述清楚变更；涉及 UI 的请附截图或动图，并关联相关 issue。

## Configuration & Content Tips
- 主要配置在 `src/config.ts` 与 `astro.config.mjs`；部署前确认站点地址与生成路径。
- 运行环境要求 Node.js >= 20、pnpm >= 9（见 README），依赖管理请使用 pnpm。
