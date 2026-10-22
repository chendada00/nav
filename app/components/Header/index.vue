
<template>
  <header
    class="site-header-grid sticky top-0 h-14 w-full gap-4 px-6 shadow-md backdrop-blur transition-all z-50 dark:shadow-white-500/50 dark:shadow-[0_4px_6px_-1px_rgb(255,255,255,0.1)]"
  >
    <!-- 左侧 Logo 和站点标题 -->
    <NuxtLink
      to="/"
      class="site-header-logo"
    >
      <div class="flex min-w-0 items-center gap-4">
        <NuxtImg
          src="/logo.png"
          alt="伴随の个人导航"
          width="32"
          height="32"
          class="h-8 w-8 shrink-0 object-contain"
        />

        <SplitText
          :text="$config.public.siteTitle"
          class-name="text-xl !hidden font-semibold md:!block"
          :delay="100"
          :duration="0.6"
          ease="power3.out"
          split-type="chars"
          :from="{ opacity: 0, y: 40 }"
          :to="{ opacity: 1, y: 0 }"
          :threshold="0.1"
          root-margin="-100px"
          text-align="center"
        />
      </div>
    </NuxtLink>

    <!-- 中间时间：不改变导航高度 -->
    <div class="site-header-clock">
      <NavigationClock />
    </div>

    <!-- 右侧功能：保留原有组件及顺序 -->
    <div class="site-header-actions">
      <SiteSearch />
      <ColorMode />
      <user-avatar />
      <JumpAdmin />
      <Logout />
    </div>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

// 判断是否暗色模式
const isDark = colorMode.preference === "dark";
</script>
