# 轻量化版本改动记录

## 保留
- 首页分类与站点导航、折叠/展开、点击站点和访问计数 RPC
- Supabase 登录/注册、OAuth 确认回调
- 分类/站点后台页面及原有 CRUD API
- 原有数据库表结构、Nuxt UI、主题切换、SEO 和分析配置

## 优化
- 首页不再挂载持续运行的 WebGL SplashCursor 和 Canvas Squares；背景改为静态 CSS 网格。
- 移除首页全屏加载遮罩，保留 Nuxt 页面导航进度条。
- 首页分类标题和站点卡片改为普通 DOM，避免每个标题/卡片创建动画实例。
- 修复 AnimatedContent 的清理逻辑：只销毁本组件的 GSAP tween/ScrollTrigger，不再清除全页面其他组件的触发器。
- 首页改请求 `/api/home`：只选择首页展示字段，不做不必要的精确总数统计；后台原有 API 不变。
- 移除未使用的外部字体 CSS 和 2 MB 的 DingTalk JinBuTi 字体资源，保留 DingTalk Sans。
- 关闭 Nuxt DevTools 和实验性 View Transitions，减少不必要的开发/过渡开销。
- 数据库初始化 SQL 添加可选查询索引。

## 部署前检查
- 在部署环境配置 `.env.example` 中列出的变量。
- 对已有 Supabase 数据库，可选择执行 `initSupabase.sql` 最后新增的索引语句；不需要重新建表。
- 运行 `pnpm install --frozen-lockfile` 和 `pnpm build`，再测试首页、登录、OAuth、后台分类 CRUD、后台站点 CRUD。
- 本次执行环境无法访问 npm registry，因此未能运行真实依赖安装和生产构建；该限制已在交付说明中注明。
