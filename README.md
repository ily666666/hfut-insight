# hfut-insight

识界前端项目，基于 Vue 3、TypeScript 和 Vite 实现，当前同时承载两套业务形态：

- 视觉应用平台
- 技能开发平台

这次版本已经完成目录重构，代码组织从“顶层混合堆放”调整为“共享层 + 平台层”结构。当前两套平台在代码归属和访问路径上都已经明确区分：视觉平台统一收口到 `/vision/*`，技能平台统一收口到 `/studio/*`。

## 技术栈

| 分类 | 说明 |
| --- | --- |
| 框架 | Vue 3 + `<script setup>` + TypeScript |
| 构建 | Vite 5 |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| UI 组件 | Ant Design Vue 4 |
| 样式方案 | UnoCSS + Sass |
| 图标 | Iconify / `@iconify-json/mdi` |
| 请求层 | Axios |
| 工具库 | VueUse、dayjs |
| 视频播放 | flv.js、hls.js |
| Mock | vite-plugin-mock-dev-server |
| 开发体验 | unplugin-auto-import、unplugin-vue-components |

## 快速开始

```powershell
cd E:\coderepository\hfut-insight

npm install
npm run dev
```

默认开发地址：

```text
http://localhost:5173
```

常用命令：

```powershell
# 启动开发环境
npm run dev

# 类型检查并构建生产包
npm run build

# 本地预览构建结果
npm run preview

# 自动修复 lint 问题
npm run lint

# 格式化源码与文档
npm run format
```

## 当前目录结构

```text
hfut-insight/
├─ public/                         # 静态资源
├─ mock/                           # 本地 Mock 数据与接口
├─ src/
│  ├─ assets/                      # 全局样式、图片等静态资源
│  ├─ router/
│  │  ├─ index.ts                  # Vue Router 创建入口
│  │  └─ routes.ts                 # 总路由装配：shared + vision + studio
│  ├─ shared/                      # 共享层：真正跨平台复用的代码
│  │  ├─ api/                      # 通用请求封装、系统管理接口
│  │  ├─ components/
│  │  │  ├─ layout/                # 通用布局壳、侧边栏、顶部栏
│  │  │  └─ task-center/           # 任务中心抽屉与面板
│  │  ├─ constants/                # 共享常量
│  │  ├─ stores/                   # 共享 Pinia Store
│  │  ├─ types/                    # 共享类型声明
│  │  ├─ views/
│  │  │  ├─ common/                # 通用页面（如 404、任务中心）
│  │  │  └─ system/                # 两个平台共用的系统管理页
│  │  ├─ navigation.ts             # 共享导航装配
│  │  └─ routes.ts                 # 共享路由
│  ├─ platforms/
│  │  ├─ vision/                   # 视觉应用平台
│  │  │  ├─ api/
│  │  │  ├─ components/
│  │  │  ├─ composables/
│  │  │  ├─ constants/
│  │  │  ├─ stores/
│  │  │  ├─ types/
│  │  │  ├─ views/
│  │  │  │  ├─ monitor/
│  │  │  │  ├─ video/
│  │  │  │  ├─ sop/
│  │  │  │  ├─ analysis/
│  │  │  │  └─ asset/
│  │  │  ├─ navigation.ts
│  │  │  └─ routes.ts
│  │  └─ studio/                   # 技能开发平台
│  │     ├─ constants/
│  │     ├─ types/
│  │     ├─ views/
│  │     ├─ navigation.ts
│  │     └─ routes.ts
│  ├─ types/                       # 自动生成的类型文件
│  │  ├─ auto-imports.d.ts
│  │  └─ components.d.ts
│  ├─ App.vue
│  └─ main.ts
├─ uno.config.ts
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

## 架构说明

### 1. 共享层 `src/shared`

这里放真正跨平台复用的能力，不再混入视觉平台或技能平台的私有业务逻辑。当前主要包括：

- 全局布局壳与左右侧边栏
- 左下角任务中心及其抽屉内容
- 系统管理页面
- 通用请求封装与共享类型

如果一个页面、组件、接口或状态只服务于某个平台，就不要放进 `shared`。

### 2. 视觉应用平台 `src/platforms/vision`

视觉平台相关代码已经全部下沉到平台目录，当前按业务域继续划分：

- `monitor`：监测预警
- `video`：视频监控
- `sop`：SOP 管理
- `analysis`：分析中心
- `asset`：资产管理

视觉平台自己的 API、Store、Composables、类型声明和演示数据也统一归位到这个目录下面。

### 3. 技能开发平台 `src/platforms/studio`

技能平台目前主要承载：

- 技能广场
- 场景模型
- 工作空间
- 数据湖
- 技能平台下的系统管理入口

当前技能平台的页面以配置驱动为主，因此核心内容集中在 `views/`、`constants/skill-pages.ts`、`routes.ts` 和 `navigation.ts`。

### 4. 路由装配

`src/router/routes.ts` 现在只负责做路由聚合：

- `sharedRoutes`
- `visionRoutes`
- `studioRoutes`
- `NotFound`

这样做的好处是，平台边界更清晰，新增业务时只需要在对应平台内部扩展即可，不需要继续把所有路由都堆到一个总文件里。

## 平台路由边界

当前保留的主要访问路径如下：

- 视觉平台：`/vision/monitor`、`/vision/video`、`/vision/sop`、`/vision/analysis`、`/vision/asset`、`/vision/system`
- 技能平台：`/studio/explore`、`/studio/workspace`、`/studio/lake`、`/studio/system`
- 共享页面：`/task-center`

说明：

- 这次调整统一了平台 URL 前缀。
- 平台区分同时体现在路由文件拆分、`meta.platform` 字段和 URL 前缀上。
- 视觉平台使用统一的 `/vision/*` 前缀，技能平台使用统一的 `/studio/*` 前缀。
- `/vision/system/*` 与 `/studio/system/*` 页面实现都复用 `shared/views/system`。

## 开发约定

- 新增跨平台能力时，优先考虑是否应该进入 `src/shared`。
- 新增平台私有页面、接口、状态、类型时，直接放到对应的 `src/platforms/*` 下。
- `src/types/auto-imports.d.ts` 和 `src/types/components.d.ts` 为自动生成文件，不建议手改。
- 如果某个模块只是“看起来像通用”，但实际上只会在一个平台使用，请放回平台目录，不要提前抽象。

## Mock 与联调

项目内保留了 `mock/` 目录，开发环境下可配合 `vite-plugin-mock-dev-server` 使用。需要联调真实接口时，优先在共享请求层或对应平台的 API 目录中接入，不建议再回到旧的顶层混合接口结构。

## 适合继续演进的方向

- 在 `shared` 中继续收敛真正复用的通用组件与类型
- 让视觉平台和技能平台分别维护自己的导航、页面配置和接口边界
- 逐步把平台内的中文乱码文案统一修正为正常 UTF-8 文本

---

如果你接下来要继续扩展这个项目，建议先判断新增需求属于：

- 共享能力
- 视觉平台能力
- 技能平台能力

再决定代码落点，这样可以尽量避免结构再次回到“所有东西都堆在 `src` 顶层”的状态。
