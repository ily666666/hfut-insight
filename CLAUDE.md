# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies from `package-lock.json`.
- `npm run dev` — start the Vite dev server on port 5173, with mock API routes enabled under `/api` by default.
- `npm run build` — run `vue-tsc --noEmit` type checking, then create the production Vite build.
- `npm run preview` — preview the production build on port 5173.
- `npm run lint` — run ESLint over `.vue`, `.ts`, and `.tsx` files and apply autofixes.
- `npm run format` — format source files under `src/` with Prettier.

There is currently no test script or test runner configured in `package.json`; use `npm run build` for the main validation pass unless tests are added later.

## Architecture

This is a Vue 3 + TypeScript + Vite single-page frontend for “识界·视觉应用平台”. The app boots in `src/main.ts`, installs Pinia, Vue Router, and Ant Design Vue, and wraps routes in `src/App.vue` with Ant Design Vue Chinese locale and shared theme tokens.

Routing is assembled in `src/router/routes.ts` from three route groups:

- `src/shared/routes.ts` contains global routes such as `/` redirecting to `/vision/monitor/camera` and `/task-center`.
- `src/platforms/vision/routes.ts` owns the visual application platform under `/vision/*`.
- `src/platforms/studio/routes.ts` owns the skill development platform under `/studio/*`.

Most platform pages render inside `src/shared/components/layout/AppLayout.vue`, which derives the active platform and primary menu from route meta. Navigation data is intentionally separate from route definitions: `src/shared/navigation.ts` combines `src/platforms/vision/navigation.ts` and `src/platforms/studio/navigation.ts`. When adding or moving a page, update both the relevant `routes.ts` and `navigation.ts` entries so the sidebar state and route meta (`platform`, `primary`, `secondary`, `title`, optional `pageActions`) stay in sync.

The source tree is split by ownership:

- `src/shared/` contains cross-platform API helpers, layout components, task center UI/store, common scaffolds, shared system pages, and shared types.
- `src/platforms/vision/` contains vision-specific APIs, components, composables, stores, types, routes, navigation, and views for monitor, video, SOP, analysis, asset, and system sections.
- `src/platforms/studio/` contains studio routes/navigation and generic skill catalog/table/data-lake pages driven by config objects in `src/platforms/studio/constants/skill-pages.ts`.
- `src/assets/styles/` contains global SCSS and variables; Vite injects `variables.scss` into all SCSS via `vite.config.ts`.

API calls should go through `src/shared/api/request.ts` via the exported `http<T>()` helper. The Axios instance uses `VITE_API_BASE_URL` or `/api`, unwraps `{ code, message, data }` responses, and shows Ant Design Vue messages for API/network errors. Mock endpoints live in `mock/*.mock.ts` and are loaded by `vite-plugin-mock-dev-server` with the same prefix.

State management uses setup-style Pinia stores. Shared state lives in `src/shared/stores/`; vision-specific state lives in `src/platforms/vision/stores/`. Vite auto-imports Vue, Vue Router, Pinia, VueUse, stores, and vision composables, and auto-registers components from `src/shared/components` and `src/platforms/vision/components`.

UI conventions in this codebase rely on Ant Design Vue components, Iconify Material Design icons (`mdi:*`), UnoCSS utilities from `uno.config.ts`, and SCSS modules/scoped styles. Shared placeholder/list pages use route meta and config-driven components such as `ModuleScaffold.vue`, `SkillCatalogPage.vue`, and `SkillTablePage.vue` rather than duplicating page shells.

## Baidu Yijian reference

When matching Baidu Yijian features, read the online documentation rather than the old local PDF. If the `WebFetch` tool cannot access `cloud.baidu.com`, fetch the HTML with curl and parse Next.js data from `__NEXT_DATA__`. Example workflow:

```bash
curl -L -A "Mozilla/5.0" --max-time 30 -o ".claude/yijian-index.html" "https://cloud.baidu.com/doc/yijian/index.html"
node -e "const fs=require('fs'); const html=fs.readFileSync('.claude/yijian-index.html','utf8'); const m=html.match(/<script id=\\\"__NEXT_DATA__\\\" type=\\\"application\\/json\\\">([\\s\\S]*?)<\\/script>/); const data=JSON.parse(m[1]); const walk=(items,p='')=>{for(const it of items||[]){const name=p? p+' / '+it.name:it.name; if(!it.children?.length) console.log(name+' -> '+it.path); else {console.log(name); walk(it.children,name)}}}; walk(data.props.pageProps.sideBarData.items);"
```

Then fetch specific pages with `https://cloud.baidu.com/doc/yijian/s/<path>` and extract text from the saved HTML before implementing. Key online docs currently include `视频监控` (`umnssc1cs`), `监测预警` (`rmnssc1ew`), `SOP合规分析` (`wmnssc16d`), `设备接入` (`3mnssc148`), `获取技能` (`4mnssc1an`), and `AI分析你的巡检图片、视频` (`hmnssc1t1`).
