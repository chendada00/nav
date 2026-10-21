// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  devServer: {
    port: 5173
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NODE_ENV === 'production' ? process.env.NUXT_SITE_URL : 'http://localhost:5173',
      siteTitle: process.env.NUXT_SITE_NAME || '拾光导航 | nav-station',
      siteDescription: process.env.NUXT_SITE_DESCRIPTION || '轻量、简洁的个人网址导航',
      siteKeywords: process.env.NUXT_SITE_KEYWORDS || '拾光导航,网址导航,效率工具,网站收藏',
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }, // 页面过渡效果
    head: {
      link: []
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/supabase',
    '@nuxtjs/color-mode',
    '@nuxtjs/seo',
    'dayjs-nuxt',
    '@nuxt/ui'
  ],
  // supabase Auth
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/']
    }
  },
  // 禁用运行时 OG 图片生成，避免不必要的图片处理依赖。
  ogImage: { enabled: false },
  // dayjs 插件
  dayjs: {
    locales: ['zh-cn'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'zh-cn',
    defaultTimezone: 'Asia/Shanghai',
  },
  // @nuxtjs/color-mode 配置
  colorMode: {
    classSuffix: ''
  },
  // @nuxt/icon 配置
  icon: {
    customCollections: [
      {
        prefix: 'my-icon',
        dir: './app/assets/icons'
      },
    ],
  },
  // @nuxt/ui 配置
  ui: {
    fonts: false
  },
  // 站点地图配置
  sitemap: {
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Priority', select: 'sitemap:priority', width: '12.5%' },
      { label: 'Change Frequency', select: 'sitemap:changefreq', width: '12.5%' },
    ],
  },
  experimental: {
    viewTransition: false
  },
  css: ['~/assets/css/main.css']
})