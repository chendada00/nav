<div align="center">

# ✨ 伴随の个人导航 ✨

### 📌 收藏好网站，让每一次访问都更简单。

一个基于 Nuxt 4、Vue 3 与 Supabase 构建的现代化个人网址导航项目，支持分类管理、实时搜索、自定义站点图标、后台维护以及网站可用性自动检测。

[🌐 在线体验](https://nav.伴随.cn/) · [📦 GitHub 仓库](https://github.com/chendada00/nav)

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxtdotjs&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-See%20LICENSE-lightgrey)

</div>

---

## 📖 项目介绍

**伴随导航**是一个面向日常高效使用的个人网址导航站，重点关注访问效率、内容组织和清晰舒适的视觉体验。

首页采用直观的分类展示，支持快速查找常用入口；管理后台则用于便捷地维护分类与网站数据。项目底层采用 **Nuxt 4** 作为全栈应用框架，并由 **Supabase** 提供可靠的数据库存储及身份认证服务。

此外，项目内置了一套由 GitHub Actions 驱动的网站可用性检测机制。检测脚本从 Supabase 读取站点地址，执行 HTTP 探活，并将结果实时写入 `ds_website_health` 表，最终由首页 API 统一读取并展示给用户。

> ⚠️ **关于自动检测的重要说明：** 当前仓库中的 `.github/workflows/check-websites.yml` 默认仅配置了 `workflow_dispatch`（即手动触发），**未默认开启 `schedule` 定时任务**。若希望实现每日自动检测，请自行在该 workflow 中按需添加相应的 cron 计划。

---

## ✨ 功能特性

- 🔎 **快速搜索**：键入关键词，秒级定位已收录的目标网站。
- 🗂️ **分类导航**：多维分类组织，让海量网址井井有条、易于浏览。
- 🖼️ **站点图标**：支持个性化网站图标及卡片配色渲染。
- 🏷️ **灵活标签**：通过多重标签精准补充网站核心属性。
- 📌 **置顶推荐**：支持重要站点置顶与精选推荐。
- 🌗 **明暗主题**：无缝切换浅色与深色外观，全天候护眼。
- 📱 **响应式布局**：完美适配桌面端、平板以及各类移动设备。
- 🔐 **安全认证与管理端**：基于 Supabase Auth 构建安全可靠的项目管理后台。
- 🟢 **可用性实时探活**：通过 GitHub Actions 自动化检测网站 HTTP 响应状态。
- 💡 **详细状态提示**：直观查看检测时间、HTTP 状态码、响应耗时及异常原因。
- 🕒 **本地时区对齐**：Day.js 默认采用 `Asia/Shanghai` 时区。
- 🎨 **细腻交互体验**：柔和背景、流畅页面过渡与精致卡片悬浮交互。

---

## 🧰 技术栈概览

| 🛠️ 技术组件 | 📝 主要用途 |
| :--- | :--- |
| **Nuxt 4** | 核心应用框架、页面路由、服务端 API 驱动 |
| **Vue 3** | 现代化组件开发与响应式界面渲染 |
| **TypeScript** | 全链路类型支持，保障代码健壮性 |
| **Nuxt UI 3** | 高颜值 UI 组件库 |
| **Tailwind CSS** | 原子化 CSS 样式与响应式布局 |
| **Supabase** | 后端云数据库与安全身份认证 |
| **`@nuxtjs/supabase`** | Nuxt 与 Supabase 深度集成模块 |
| **GitHub Actions** | 定期/手动执行网站可用性检测任务 |
| **Day.js** | 高效的日期、时间及 UTC/时区处理 |
| **GSAP / Motion** | 丝滑的页面动画与交互特效 |
| **Nuxt SEO** | 全方位搜索引擎优化（SEO）能力支持 |

---

## 📁 项目结构

以下列出核心目录与配置文件，项目在后续迭代中可能会进行小幅调整：

```text
nav/
├── 📂 app/
│   ├── 📂 assets/
│   │   ├── 📂 css/                 # 全局样式定义
│   │   ├── 📂 fonts/               # 本地自定义字体
│   │   └── 📂 icons/               # 自定义图标集合
│   ├── 📂 components/              # Vue 公共及业务组件
│   ├── 📂 layouts/                 # 页面骨架布局
│   ├── 📂 pages/                   # 视图页面路由
│   ├── 📂 middleware/              # 页面路由中间件
│   └── 📄 app.vue                  # 应用根组件及全局 Head 配置
├── 📂 lib/                         # 公共类型定义、枚举与工具
├── 📂 server/
│   └── 📂 api/                     # Nitro 服务端 API 接口
├── 📂 scripts/
│   └── 📄 check-websites.mjs       # 核心网站可用性检测脚本
├── 📂 public/                      # 静态资源目录
├── 📂 .github/
│   └── 📂 workflows/
│       └── 📄 check-websites.yml   # 网站自动化检测 GitHub Action
├── 📄 .env.example                 # 环境变量模板文件
├── 📄 nuxt.config.ts               # Nuxt 主配置文件
├── 📄 package.json                 # 依赖包管理与脚本命令
├── 📄 pnpm-lock.yaml               # pnpm 依赖锁文件
└── 📄 README.md                    # 项目说明文档
```

---

## ⚙️ 环境变量与配置说明

### 1. 本地环境变量配置

当前仓库根目录下的 `.env.example` 模板文件定义了以下核心变量：

| 🔑 变量名 | 📌 必填状态 | 📝 用途说明 | 💡 示例参考 |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | **是** | Supabase 项目 URL，供 Nuxt 模块建立连接 | `[https://xxxx.supabase.co](https://xxxx.supabase.co)` |
| `SUPABASE_KEY` | **是** | Supabase 客户端公开密钥（`anon/public` key） | `YOUR_SUPABASE_ANON_KEY` |
| `NUXT_SITE_URL` | 生产环境建议 | 线上正式访问地址，用于生成生产环境 `baseUrl` | `[https://nav.example.com](https://nav.example.com)` |
| `NUXT_SITE_NAME` | 否 | 站点名称，映射至 `runtimeConfig.public.siteTitle` | `伴随导航` |
| `NUXT_SITE_DESCRIPTION` | 否 | 站点描述，映射至 `runtimeConfig.public.siteDescription` | `轻量、简洁的个人网址导航` |
| `NUXT_SITE_KEYWORDS` | 否 | SEO 关键词，映射至 `runtimeConfig.public.siteKeywords` | `网址导航,效率工具` |

快速初始化本地配置：

```bash
cp .env.example .env
```

随后根据你的 Supabase 实际云端项目参数及域名修改 `.env` 文件。

> 💡 **安全提示：**
> - `SUPABASE_KEY` 必须填写客户端公开密钥（`anon`），**切勿**填入具有极高权限的 `service_role` 密钥。
> - `.env` 文件属于本地私有配置，**严禁**提交至 Git 仓库。
> - `NUXT_SITE_URL` 在线上生产环境请务必填写带 `https://` 的正式域名。
> - 修改 `NUXT_SITE_NAME` 等配置后，需要重启开发服务或重新构建项目才能生效。

### 2. Nuxt Runtime Config 运行时配置

当前 `nuxt.config.ts` 中的 `runtimeConfig` 结构如下：

```ts
runtimeConfig: {
  public: {
    baseUrl: process.env.NODE_ENV === 'production'
      ? process.env.NUXT_SITE_URL
      : 'http://localhost:5173',
    siteTitle: process.env.NUXT_SITE_NAME || '拾光导航 | nav-station',
    siteDescription: process.env.NUXT_SITE_DESCRIPTION || '轻量、简洁的个人网址导航',
    siteKeywords: process.env.NUXT_SITE_KEYWORDS || '拾光导航,网址导航,效率工具,网站收藏',
  }
}
```

| ⚙️ 配置字段 | 📥 数据来源 | 📝 详细说明 |
| :--- | :--- | :--- |
| `runtimeConfig.public.baseUrl` | 生产环境读取 `NUXT_SITE_URL`；开发环境默认固定为 `http://localhost:5173` | 当前站点基础基准地址 |
| `runtimeConfig.public.siteTitle` | 对应环境变量 `NUXT_SITE_NAME` | 浏览器标签页及全局站点标题 |
| `runtimeConfig.public.siteDescription` | 对应环境变量 `NUXT_SITE_DESCRIPTION` | 页面 Meta 描述 |
| `runtimeConfig.public.siteKeywords` | 对应环境变量 `NUXT_SITE_KEYWORDS` | SEO 搜索引擎检索关键词 |

> 🔒 **注意：** 以上字段均位于 `public` 作用域下，会直接暴露给客户端浏览器。**请勿将数据库管理员密钥、服务端私钥或其他机密 Token 放入 `runtimeConfig.public` 中。**

Nuxt 生产环境可以通过 `NUXT_PUBLIC_*` 变量覆盖 `runtimeConfig.public` 中与命名规则匹配的配置项；但当前项目的 `baseUrl`、`siteTitle` 等初始化值仍由 `nuxt.config.ts` 中的 `process.env.NUXT_SITE_*` 逻辑生成。部署时建议按 `.env.example` 使用项目已经明确支持的变量名，不要随意改名。

### 3. Nuxt 与其他固定配置项

以下内容并非通过环境变量注入，而是写在源码中的固有配置：

| ⚙️ 配置项 | 📌 当前默认值 | 📝 作用说明 |
| :--- | :--- | :--- |
| **开发服务器端口** | `5173` | 执行 `nuxt dev` 时默认监听的本地端口 |
| **Day.js 默认时区** | `Asia/Shanghai` | 日期与时间的标准渲染时区 |
| **Day.js 本地语言** | `zh-cn` | 日期格式化中文本地化支持 |
| **登录页路由路径** | `/login` | Supabase Auth 身份未授权重定向页 |
| **Auth 回调路径** | `/confirm` | Supabase 登录验证回调路由 |
| **登录重定向白名单** | `/` | 首页属于公开页面，不强制拦截跳转登录 |
| **自定义图标前缀** | `my-icon` | 对应 `app/assets/icons` 目录下的图标集 |
| **全局样式入口** | `~/assets/css/main.css` | Tailwind 及项目的全局样式文件 |

如需调整上述逻辑，请直接编辑 `nuxt.config.ts` 源码，无需在部署平台额外配置同名环境变量。

---

## 🗄️ Supabase 数据库配置

项目目前强依赖以下三张核心数据表：

- `ds_categorys`：存储网站分类信息。
- `ds_websites`：存储具体的网站记录。
- `ds_website_health`：存储各个网站最近一次的可用性检测结果。

### 1. 首页读取的数据字段结构

首页 API (`server/api/home.get.ts`) 会联表读取分类及其归属的网站列表。

**`ds_categorys` 当前查询字段：**

| 📊 字段名 | 📝 用途说明 |
| :--- | :--- |
| `id` | 分类 ID |
| `name` | 分类名称 |
| `icon` | 分类图标 |
| `sort` | 分类排序值 |
| `created_at` | 创建时间 |

**关联的 `ds_websites` 当前查询字段：**

| 📊 字段名 | 📝 用途说明 |
| :--- | :--- |
| `id` | 网站 ID |
| `name` | 网站名称 |
| `url` | 网站地址 |
| `logo` | 网站图标地址或图标配置 |
| `color` | 网站图标/卡片配色字段 |
| `vpn` | 是否提示需要 VPN |
| `tags` | 网站标签 |
| `desc` | 网站描述 |
| `pinned` | 是否置顶 |
| `recommend` | 是否推荐 |
| `sort` | 排序值 |
| `created_at` | 创建时间 |

> 💡 首页默认先按分类的 `sort` 倒序、`created_at` 倒序读取；分类内部的网站则依次按照“置顶状态、排序值、推荐状态、创建时间”进行综合排序。请确保数据库表结构与字段名称与代码保持一致。

### 2. 网站可用性检测结果表 (`ds_website_health`)

该表用于持久化保存各网站最近一次的探活结果。当前首页和检测脚本涉及以下字段：

| 📊 字段名 | 📝 用途说明 |
| :--- | :--- |
| `website_id` | 对应 `ds_websites.id` 的外键关联 ID |
| `status` | 检测状态：`up`（正常）、`down`（异常）或 `unknown`（未知） |
| `checked_at` | 最近一次检测的 ISO 时间戳 |
| `http_status` | 目标服务器返回的 HTTP 响应状态码 |
| `response_time_ms` | 接口响应耗时（单位：毫秒） |
| `error_code` | 探活失败时的异常代码或错误信息 |
| `consecutive_failures` | 连续失败累计次数 |
| `updated_at` | 记录最后更新时间 |

检测脚本使用 `website_id` 作为 `upsert` 冲突更新的唯一键，因此该字段需要具备**唯一约束（Unique Constraint）**；同时应建立与 `ds_websites.id` 对应的外键关系。请在 Supabase 中确认表、字段、类型、唯一约束、外键和 RLS 策略均已正确配置。

> ⚠️ **建表提醒：** 本 README 不臆造完整建表 SQL：仓库当前没有随项目提供可核验的 Supabase schema/migration 文件。首次部署时，请以你现有 Supabase 数据库结构为准，不要直接执行未经核对的建表语句，以免覆盖已有数据。

### 3. Supabase Auth 身份认证配置

项目通过 `@nuxtjs/supabase` 实现后台登录控制，当前配置：

- 登录路径：`/login`
- 回调路径：`/confirm`
- 首页 `/` 在重定向排除列表中。

部署线上服务后，请务必前往 Supabase Dashboard 的 **Authentication → URL Configuration** 中核对以下配置：

1. **Site URL**：填写线上正式的主域名，例如 `[https://nav.example.com](https://nav.example.com)`。
2. **Redirect URLs**：添加允许跳转的回调路径，例如 `[https://nav.example.com/confirm](https://nav.example.com/confirm)`。
3. **本地开发调试**：若需在本地测试登录，请按 Supabase 规范同步添加 `http://localhost:5173/confirm` 等本地回调地址。
4. **第三方 OAuth**：若启用了 GitHub/Google 等第三方登录，还需前往对应开放平台更新回调 URL，确保全链路协议与路径一致。

回调地址必须与实际部署域名、协议和路径一致。更换域名后，需要同步更新 Supabase 配置。

---

## 🟢 网站可用性检测机制

### 1. 自动化检测工作流

1. 触发 GitHub Actions `Check website availability` 工作流。
2. 调度执行 `node scripts/check-websites.mjs` 脚本。
3. 脚本通过 Supabase REST API 批量拉取 `ds_websites` 中的 `id` 与 `url`。
4. 获取 `ds_website_health` 中历史的连续失败次数与状态。
5. 高并发对各个站点发起 HTTP 探活检测。
6. 将最新检测结果按 `website_id` 通过 `upsert` 写回 `ds_website_health` 表。
7. 首页 API 读取健康数据并与网站信息实时合并展示。

### 2. 探活核心参数

检测参数直接定义在 `scripts/check-websites.mjs` 文件中，不是 GitHub Actions Variables：

| ⚙️ 常量参数 | 📌 当前默认值 | 📝 说明 |
| :--- | :--- | :--- |
| `REQUEST_TIMEOUT_MS` | `8000` | 单次 HTTP 请求超时时间（毫秒） |
| `CONCURRENCY` | `8` | 异步并发检测的数量限制 |
| `DOWN_AFTER_FAILURES` | `2` | 连续失败达到该次数后，状态正式标记为 `down` |

如需调整策略，直接修改 `scripts/check-websites.mjs` 对应常量即可。

### 3. 状态判定标准

| 🏷️ 状态值 | 📝 含义解释 |
| :--- | :--- |
| `up` | 最近一次检测收到了 HTTP `200` 至 `499` 之间的标准响应 |
| `unknown` | 尚无历史检测记录，或当前连续失败次数尚未达到判定阈值 |
| `down` | 连续探活失败次数达到或超过 `DOWN_AFTER_FAILURES` 设定阈值 |

> 💡 **提示：** HTTP `4xx` 也会被当前脚本判定为 `up`，这只表示目标服务器存活并做出了响应，不代表网页内容或业务功能正常。遭遇 HTTP `5xx`、网络错误、超时等会累计失败次数。

脚本会检查 URL 协议、用户名/密码、主机名及 DNS 解析地址，并拦截常见内网/本地地址，以降低检测脚本访问内网地址的风险。

检测结果只代表 GitHub Actions Runner 所在网络环境的访问情况，不保证所有地区、运营商或 VPN 环境都能访问。

### 4. GitHub Actions 工作流配置

当前工作流文件：

```text
.github/workflows/check-websites.yml
```

当前工作流触发方式：

```yaml
on:
  workflow_dispatch:
```

也就是说，**当前版本仅支持手动运行，没有配置定时 cron。**

工作流还配置了：

- **Runner**：`ubuntu-latest`
- **Node.js**：`22`
- **Job 超时限制**：`15` 分钟
- **并发控制**：`website-availability-check`
- **`cancel-in-progress`**：`false`
- **权限**：`contents: read`

### 5. GitHub Secrets 密钥配置

请前往 GitHub 仓库的 **Settings → Secrets and variables → Actions → New repository secret** 添加以下密钥：

| 🔑 Secret 名称 | 📝 内容 | 🛠️ 用途说明 |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase 项目 URL | 供 GitHub Actions 脚本连接数据库 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | 赋权脚本高权限读写检测结果数据 |

> 🔒 **安全红线：**
> - `SUPABASE_SERVICE_ROLE_KEY` 权限较高，**仅可**存放在 GitHub Actions Secrets 或可信任的服务端密钥管理系统中。
> - 不要把它写入 `.env.example`、前端代码、`runtimeConfig.public` 或 README。
> - 不要将其提交到 Git 仓库，也不要粘贴到公开 Issue 或日志。
> - GitHub Actions 中使用 Secrets，而不是公开的 Repository Variables。

### 6. 手动执行一次检测

1. 打开 GitHub 仓库。
2. 进入 `Actions`。
3. 选择 `Check website availability`。
4. 点击 `Run workflow`。
5. 选择分支并确认运行。
6. 打开本次执行记录查看日志。

### 7. 如何每天定时自动检测？

当前 workflow 没有定时配置。如果需要每天 0 点和 12 点运行，可以在 `.github/workflows/check-websites.yml` 的 `on` 中增加：

```yaml
on:
  workflow_dispatch:
  schedule:
    # GitHub Actions cron 使用 UTC 时区。
    # 北京时间 00:00 对应 UTC 16:00（前一天）。
    - cron: '0 16 * * *'
    # 北京时间 12:00 对应 UTC 04:00。
    - cron: '0 4 * * *'
```

GitHub Actions 的 cron 按 UTC 解释。上面的两个表达式对应北京时间每天 00:00 和 12:00。定时任务可能受到 GitHub 调度延迟影响，实际执行时间请以 Actions 记录为准。

---

## 💻 本地开发指南

### 1. 环境要求

| 🛠️ 工具 | 💡 建议配置 |
| :--- | :--- |
| **Node.js** | 建议使用 Node.js 22 LTS，与当前 GitHub Actions 运行环境保持一致 |
| **包管理器** | pnpm |
| **pnpm 版本** | `package.json` 声明为 `pnpm@8.15.5` |
| **Supabase** | 准备可访问的 Supabase 项目及客户端公开密钥 |

### 2. 克隆项目

```bash
git clone https://github.com/chendada00/nav.git
cd nav
```

### 3. 安装 pnpm 并安装依赖

```bash
corepack enable
corepack prepare pnpm@8.15.5 --activate
pnpm install
```

项目使用 `pnpm-lock.yaml`，建议使用 pnpm，不要混用 npm/yarn 安装后再提交其他包管理器的锁文件。

### 4. 配置本地环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填写自己的 Supabase URL、客户端公开密钥和站点信息。

### 5. 启动本地开发服务

```bash
pnpm dev
```

打开浏览器访问：

```text
http://localhost:5173
```

开发服务器端口在 `nuxt.config.ts` 中配置为 `5173`。

### 6. 构建和本地预览

```bash
# 构建 Node.js 服务端产物
pnpm build

# 启动生产构建产物
pnpm start
```

也可以使用：

```bash
pnpm preview
```

当前 `preview` 脚本同样通过 Node 启动 `.output/server/index.mjs`。

---

## 🚀 生产部署指南

### 方案一：Vercel 部署（强烈推荐）

项目使用 Nuxt 4，适合部署到支持 Nuxt/Nitro 的平台。Vercel 可以连接 GitHub 仓库，在代码推送后自动构建部署。

#### 1. 导入仓库

1. 登录 [Vercel](https://vercel.com/)。
2. 选择 `Add New → Project`。
3. 导入 `chendada00/nav`。
4. Framework Preset 选择 Nuxt（通常可自动识别）。
5. Root Directory 使用仓库根目录。

#### 2. 配置环境变量

在 Vercel 项目的 **Settings → Environment Variables** 中添加：

| 🔑 Name | 📝 Value |
| :--- | :--- |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_KEY` | Supabase 客户端公开密钥 |
| `NUXT_SITE_URL` | 线上正式 HTTPS 地址 |
| `NUXT_SITE_NAME` | 网站名称 |
| `NUXT_SITE_DESCRIPTION` | 网站描述 |
| `NUXT_SITE_KEYWORDS` | SEO 关键词 |

按需选择 Production、Preview、Development 环境。修改环境变量后，需要重新部署才能使新配置生效。

不要在 Vercel 的公开环境变量中配置 `SUPABASE_SERVICE_ROLE_KEY`。该密钥只用于网站检测 Action；如确实要在其他服务端任务中使用，也必须放在非公开 Secret 中。

#### 3. 部署

确认 Build Command 使用 Nuxt 默认构建，或执行：

```bash
pnpm build
```

部署完成后绑定自己的域名，并确认 HTTPS 生效。

#### 4. 配置 Supabase 回调

将 Vercel 绑定后的正式域名设置为 Supabase Site URL，并将：

```text
https://你的域名/confirm
```

添加到 Redirect URLs。

#### 5. 检查清单

- 首页是否能正常加载分类和网站。
- 登录、退出及回调是否正常。
- 后台增删改查是否正常。
- 网站图标是否正常加载。
- `/api/home` 是否返回正常数据。
- GitHub Actions 检测任务是否能正常访问 Supabase。

### 方案二：自有服务器 / VPS 部署（Node.js）

当前项目提供 Nuxt Node Server 产物，可在具备 Node.js 环境的服务器上运行。

#### 1. 安装环境

服务器安装 Node.js 22 LTS，并安装 pnpm 8.15.5。

#### 2. 获取代码

```bash
git clone https://github.com/chendada00/nav.git
cd nav
```

#### 3. 配置环境变量

在项目根目录创建 `.env`，填写生产配置：

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

NUXT_SITE_URL=https://your-domain.example
NUXT_SITE_NAME=伴随导航
NUXT_SITE_DESCRIPTION=轻量、简洁的个人网址导航
NUXT_SITE_KEYWORDS=网址导航,效率工具,网站收藏
```

生产环境也可以通过进程管理器或部署平台注入环境变量，不一定要把 `.env` 文件放在服务器上。

#### 4. 安装依赖并构建

```bash
corepack enable
corepack prepare pnpm@8.15.5 --activate

pnpm install --frozen-lockfile
pnpm build
```

#### 5. 启动服务

```bash
node .output/server/index.mjs
```

Nuxt Nitro Node Server 默认监听 `3000` 端口。可通过 `PORT` 和 `HOST` 环境变量调整监听端口及地址，例如：

```bash
PORT=3000 HOST=127.0.0.1 node .output/server/index.mjs
```

建议使用 PM2、systemd 或其他进程管理工具守护 Node 进程，并通过 Nginx/Caddy 配置 HTTPS 反向代理。

Nginx 反向代理示例：

```nginx
server {
    listen 80;
    server_name your-domain.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

请根据实际域名和证书配置 HTTPS。不要直接把 Node 服务端口暴露到公网而忽略 HTTPS 和反向代理配置。

### 方案三：静态站点部署（⚠️ 需要谨慎）

项目虽然提供：

```bash
pnpm generate
```

但首页通过 `/api/home` 读取 Supabase 数据，项目也包含服务端 API 和身份认证流程。纯静态托管无法直接运行 Nitro 服务端 API。

因此，**除非你已经单独处理 API、身份认证和数据请求，否则不要把 `pnpm generate` 的静态产物直接当作完整生产部署方案。** 普通部署优先使用 Vercel 或 Node.js 服务端部署。

---

## 📦 package.json 命令说明

当前 `package.json` 中定义的脚本：

| ⚡ 命令 | 🛠️ 实际执行内容 | 📝 用途说明 |
| :--- | :--- | :--- |
| `pnpm dev` | `nuxt dev` | 启动本地热更新开发服务 |
| `pnpm build` | `nuxt build` | 构建生产版本 |
| `pnpm generate` | `nuxt generate` | 生成纯静态站点 |
| `pnpm preview` | `node .output/server/index.mjs` | 启动构建后的 Node 服务 |
| `pnpm start` | `node .output/server/index.mjs` | 启动生产 Node 服务 |
| `pnpm postinstall` | `nuxt prepare` | 安装依赖后准备 Nuxt 类型及构建环境 |
| `pnpm release` | `release-it` | 执行 release-it 发布流程 |

---

## 🔧 常见问题排查 (FAQ)

### 1. 首页没有分类或网站数据

- 检查 `SUPABASE_URL` 是否正确。
- 检查 `SUPABASE_KEY` 是否为正确的客户端公开密钥。
- 检查 Supabase 数据表是否存在。
- 检查 `ds_categorys`、`ds_websites` 的关联关系和 RLS 策略。
- 打开浏览器开发者工具，查看 `/api/home` 的响应和错误信息。

### 2. 登录后无法跳转或提示回调错误

- 检查 Supabase Site URL。
- 检查 Redirect URLs 是否包含当前域名的 `/confirm`。
- 检查 OAuth 服务商配置的回调地址。
- 检查线上是否使用 HTTPS。
- 域名变更后，记得同步更新 Supabase 配置。

### 3. GitHub Actions 检测失败

检查仓库是否配置：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

同时确认：

- Supabase 项目没有暂停或不可访问。
- `ds_websites` 表可读取。
- `ds_website_health` 表可读取和 upsert。
- `website_id` 有唯一约束。
- 外键及字段名称与脚本一致。

### 4. 为什么 Actions 没有每天自动运行？

当前仓库的 workflow 只有 `workflow_dispatch`，没有 `schedule`。需要按上文增加 cron 配置，提交后才会启用定时触发。

### 5. 修改环境变量后页面没有变化

- 本地开发环境：重启 `pnpm dev`。
- Vercel：修改环境变量后重新部署。
- 自有服务器：重新构建并重启 Node 服务。
- 确认变量名与 `.env.example` 完全一致。

### 6. 静态部署后 `/api/home` 访问失败

这是因为静态托管不会运行 Nuxt Nitro 服务端 API。请改用 Vercel/Nuxt Node Server 等支持服务端运行的部署方式，或自行实现独立 API。

---

## 🔒 安全建议

- 严禁将 Supabase `service_role` 密钥暴露给浏览器。
- `.env` 敏感文件切勿提交至 Git。
- GitHub Actions Secrets 只保存检测脚本所需的服务端密钥。
- Supabase 应正确配置 RLS，不能只依赖前端隐藏管理入口。
- 管理端写操作应在服务端/数据库策略层验证身份及权限。
- 为 Supabase 和 GitHub 账号启用合适的安全保护。
- 定期检查依赖更新和 GitHub Actions 日志，避免意外泄漏敏感信息。

---

## 🌐 在线体验

🔗 **访问地址**：[https://nav.伴随.cn/](https://nav.伴随.cn/)

---

## 🤝 致谢

本项目的开发与界面实现参考并感谢原仓库及作者的开源工作：

- **原仓库**：[https://github.com/baiwumm/better-nav](https://github.com/baiwumm/better-nav)
- **原作者**：[@baiwumm](https://github.com/baiwumm)

感谢 Nuxt、Vue、Supabase 以及所有开源依赖项目的贡献者。

---

## 📄 许可证

请以仓库中实际的 `LICENSE` 文件为准。使用、修改或二次分发前，请确认原项目及依赖的许可证要求。

---

<div align="center">

**Powered by 伴随** · 让常用网站触手可及。

</div>
