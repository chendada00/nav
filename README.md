<div align="center">

# ✨ 伴随の个人导航 ✨

### 收藏好网站，让每一次访问都更简单。

一个基于 Nuxt 4 与 Supabase 构建的轻量个人网址导航项目，帮助你整理常用网站、快速搜索目标，并通过分类管理自己的网络入口。

[🌐 在线体验](https://nav.伴随.cn/) · [📦 GitHub 仓库](https://github.com/chendada00/nav)

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxtdotjs&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-See%20LICENSE-lightgrey)

</div>

---

## 📖 项目介绍

伴随导航是一个面向日常使用的个人网址导航站，重点关注访问效率、内容组织和清晰的视觉体验。

首页支持按分类浏览网站，也可以使用搜索功能快速定位目标。项目采用 Nuxt 构建前端，并使用 Supabase 提供数据服务。

项目还通过 GitHub Actions 定时检测收录网站的 HTTP 响应情况，并将检测结果保存到 Supabase，供首页展示状态指示器。

## 🚀 功能特性

- 🔎 **快速搜索**：帮助快速查找已收录的网站。
- 🗂️ **分类导航**：按分类组织网站，方便浏览和整理。
- 🖼️ **网站图标**：展示网站图标，提升辨识效率。
- 🌗 **明暗主题**：支持浅色与深色外观。
- 📱 **响应式布局**：适配手机、平板和桌面屏幕。
- 🔐 **用户与管理功能**：结合项目现有的登录及后台管理组件。
- ☁️ **数据服务**：使用 Supabase 提供网站和分类数据。
- 🟢 **网站可用性检测**：GitHub Actions 定时检测站点，并在首页显示状态圆点。
- 💡 **检测详情提示**：鼠标悬浮状态圆点时，可查看检测时间、HTTP 状态和响应耗时。
- 🎨 **简洁界面**：轻量布局、柔和配色，减少不必要的视觉干扰。

## 🟢 网站可用性检测

### 检测流程

1. GitHub Actions 按计划启动检测脚本。
2. 脚本从 Supabase 读取已收录的网站地址和上一轮检测结果。
3. 脚本并发访问网站，记录 HTTP 状态码、响应耗时和检测时间。
4. 检测结果批量写入 Supabase 的 `ds_website_health` 表。
5. 首页 API 按网站 UUID 合并检测结果，前端以状态圆点展示。

### 状态含义

| 状态 | 展示 | 含义 |
| --- | --- | --- |
| `up` | 绿色呼吸圆点 | 最近一次检测收到 HTTP 200–499 响应 |
| `down` | 红色圆点 | 连续检测失败达到阈值 |
| `unknown` | 灰色圆点 | 尚无检测结果，或失败次数尚未达到判定阈值 |

HTTP 4xx 代表服务器有响应，不一定表示网站页面或业务功能正常。检测结果仅代表 GitHub Actions 所在网络环境的访问情况，不保证所有地区、网络或 VPN 环境都能访问。

网站需要 VPN、存在地区限制或对自动化请求进行拦截时，检测结果可能与用户实际访问体验不同。

### Supabase 检测表

检测结果保存在 `public.ds_website_health` 表中，主要字段如下：

| 字段 | 说明 |
| --- | --- |
| `website_id` | 对应 `ds_websites.id` 的网站 UUID |
| `status` | 检测状态：`up`、`down` 或 `unknown` |
| `checked_at` | 最近检测时间 |
| `http_status` | HTTP 响应状态码 |
| `response_time_ms` | 请求耗时，单位为毫秒 |
| `error_code` | 检测失败时的错误信息 |
| `consecutive_failures` | 连续失败次数 |
| `updated_at` | 记录更新时间 |

创建检测表前，请先确认当前 Supabase 项目已经存在 `ds_websites` 表。检测表通过 `website_id` 外键关联网站记录。

### GitHub Actions Secrets

定时检测需要在 GitHub 仓库中配置以下 Secrets：

| Secret 名称 | 内容 |
| --- | --- |
| `SUPABASE_URL` | Supabase 项目的 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 |

配置路径：

`GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret`

Supabase 项目 URL 和 API 密钥可在 Supabase Dashboard 的项目设置中查找。请使用与当前项目对应的服务端密钥。

**安全要求：**

- `SUPABASE_SERVICE_ROLE_KEY` 具有较高权限，只能用于服务端或受保护的 CI 环境。
- 不要将服务端密钥写入前端代码、公开环境变量、README 或提交到 Git 仓库。
- 不要在 Issue、公开日志或聊天中粘贴密钥。
- 首页只读取检测结果，不应使用服务端密钥执行写入。

### 手动运行检测

在 GitHub 仓库打开：

`Actions → Check website availability → Run workflow`

可以手动启动一次检测。自动检测的实际运行时间以 GitHub Actions 执行记录为准。

## 🧰 技术栈

| 技术 | 用途 |
| --- | --- |
| Nuxt 4 | 应用框架与页面路由 |
| Vue 3 | 组件与响应式界面 |
| TypeScript | 类型支持 |
| Nuxt UI | UI 组件 |
| Tailwind CSS | 样式与响应式布局 |
| Supabase | 网站、分类及检测结果数据 |
| GitHub Actions | 定时执行网站可用性检测 |

## 🖥️ 本地运行

### 环境要求

- Node.js：使用项目依赖支持的 Node.js 版本。
- 包管理器：优先使用仓库锁文件对应的工具。
- Supabase 项目：如果需要访问线上数据，请准备相应配置。

### 1. 获取项目

```bash
git clone https://github.com/chendada00/nav.git
cd nav
```

### 2. 安装依赖

如果仓库使用 pnpm：

```bash
pnpm install
```

如果实际锁文件对应 npm 或其他包管理器，请使用对应的安装命令，不要混用不同包管理器生成的锁文件。

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，并填写自己的配置：

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_PUBLIC_KEY

NUXT_SITE_URL=https://nav.伴随.cn/
NUXT_SITE_NAME=伴随导航
NUXT_SITE_DESCRIPTION=轻量、简洁的个人网址导航
NUXT_SITE_KEYWORDS=网址导航,效率工具,网站收藏
```

说明：

- `SUPABASE_URL`：Supabase 项目 URL。
- `SUPABASE_KEY`：项目使用的公开客户端密钥。
- `NUXT_SITE_URL`：网站正式访问地址。
- `NUXT_SITE_NAME`：网站名称。
- `NUXT_SITE_DESCRIPTION`：网站描述。
- `NUXT_SITE_KEYWORDS`：网站关键词。

请以当前项目的 `.env.example` 和 Supabase 配置为准。

**不要将 `service_role` 密钥写入本地公开配置、客户端代码或提交到 Git 仓库。**

### 4. 启动开发环境

```bash
pnpm dev
```

根据终端输出访问本地开发地址。

### 5. 构建生产版本

```bash
pnpm build
```

如果需要静态预览或部署，请先查看项目 `package.json` 中现有的 `generate`、`preview` 等脚本，并根据实际部署平台选择合适的方式。

## ⚙️ 配置说明

项目主要配置文件：

| 文件 | 作用 |
| --- | --- |
| `nuxt.config.ts` | Nuxt、站点元数据和模块配置 |
| `package.json` | 依赖与运行脚本 |
| `.env.example` | 环境变量配置模板 |
| `app/app.vue` | 全局页面结构与站点元数据 |
| `app/pages/index.vue` | 首页导航界面及检测状态展示 |
| `app/assets/css/main.css` | 全局样式 |
| `app/components/Header/index.vue` | 顶部导航 |
| `app/components/Footer/index.vue` | 页脚信息 |
| `server/api/home.get.ts` | 首页数据与检测结果接口 |
| `scripts/check-websites.mjs` | 网站可用性检测脚本 |
| `.github/workflows/check-websites.yml` | 定时检测工作流 |
| `public/favicon.ico` | 网站品牌图标 |

## 🎨 自定义

你可以根据自己的需求调整：

- 网站名称与 SEO 描述。
- 网站分类和收录内容。
- 首页卡片布局与间距。
- 浅色及深色主题配色。
- 品牌图标和页脚展示信息。
- 网站检测周期、超时时间和连续失败判定阈值。

修改前建议先确认相关数据结构和组件引用，避免影响现有的搜索、登录和后台功能。

## 🌐 在线体验

访问 [https://nav.伴随.cn/](https://nav.伴随.cn/) 使用导航站。

## 🤝 致谢

- **致谢原仓库**：[https://github.com/baiwumm/better-nav](https://github.com/baiwumm/better-nav)
- **原作者**：[@baiwumm](https://github.com/baiwumm)

## 📄 许可证

请以仓库中实际的 `LICENSE` 文件为准。若项目尚未提供许可证，请在确认授权方式后再添加相应声明。

---

<div align="center">

**Powered by 伴随** · 让常用网站触手可及。

</div>