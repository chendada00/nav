
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

你可以通过首页分类浏览网站，也可以使用搜索功能快速定位目标。项目采用 Nuxt 构建前端，并使用 Supabase 提供相关数据服务。

## 🚀 功能特性

- 🔎 **快速搜索**：帮助你快速查找已收录的网站。
- 🗂️ **分类导航**：按分类组织网站，方便浏览和整理。
- 🖼️ **网站图标**：展示网站图标，提升辨识效率。
- 🌗 **明暗主题**：支持浅色与深色外观。
- 📱 **响应式布局**：适配手机、平板和桌面屏幕。
- 🔐 **用户与管理功能**：结合项目现有的登录及后台管理组件。
- ☁️ **数据服务**：使用 Supabase 相关配置连接后端服务。
- 🎨 **简洁界面**：轻量布局、柔和配色，减少不必要的视觉干扰。

## 🧰 技术栈

| 技术 | 用途 |
| --- | --- |
| Nuxt 4 | 应用框架与页面路由 |
| Vue 3 | 组件与响应式界面 |
| TypeScript | 类型支持 |
| Nuxt UI | UI 组件 |
| Tailwind CSS | 样式与响应式布局 |
| Supabase | 数据及相关后端服务 |

## 🖥️ 本地运行

### 环境要求

- Node.js：建议使用项目所依赖版本范围内的受支持版本。
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
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

NUXT_SITE_URL=https://nav.伴随.cn/
NUXT_SITE_NAME=伴随导航
NUXT_SITE_DESCRIPTION=轻量、简洁的个人网址导航
NUXT_SITE_KEYWORDS=网址导航,效率工具,网站收藏
```

说明：

- `SUPABASE_URL`：Supabase 项目 URL。
- `SUPABASE_KEY`：客户端使用的公开匿名密钥；如果你的 Supabase 项目采用新的 publishable key 配置方式，应以当前项目代码实际支持的格式为准。
- `NUXT_SITE_URL`：网站正式访问地址。
- `NUXT_SITE_NAME`：网站名称。
- `NUXT_SITE_DESCRIPTION`：网站描述。
- `NUXT_SITE_KEYWORDS`：网站关键词。

**安全提醒：** 不要将 Supabase `service_role` 密钥或其他服务端秘密写入客户端代码、提交到公开仓库或暴露给浏览器。请根据实际部署环境设置环境变量。

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
| `app/pages/index.vue` | 首页导航界面 |
| `app/assets/css/main.css` | 全局样式 |
| `app/components/Header/index.vue` | 顶部导航 |
| `app/components/Footer/index.vue` | 页脚信息 |
| `public/favicon.ico` | 网站品牌图标 |

## 🎨 自定义

你可以根据自己的需求调整：

- 网站名称与 SEO 描述。
- 网站分类和收录内容。
- 首页卡片布局与间距。
- 浅色及深色主题配色。
- 品牌图标和页脚展示信息。

修改前建议先确认相关数据结构和组件引用，避免影响现有的搜索、登录和后台功能。

## 🌐 在线体验

访问 [https://nav.伴随.cn/](https://nav.伴随.cn/) 使用导航站。

## 📄 许可证

请以仓库中实际的 `LICENSE` 文件为准。若项目尚未提供许可证，请在确认授权方式后再添加相应声明。

---

<div align="center">

**Powered by 伴随** · 让常用网站触手可及。

</div>
