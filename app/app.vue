
<template>
  <div class="app-root">
    <div
      class="site-background"
      aria-hidden="true"
    />

    <UApp>
      <NuxtLayout>
        <NuxtLoadingIndicator />
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>

<script setup lang="ts">
useHead({
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
  ],
  meta: [
    {
      name: "keywords",
      content: "拾光导航,网址导航,效率工具,网站收藏",
    },
    {
      name: "description",
      content: "拾光导航（nav-station），轻量、简洁的个人网址导航。",
    },
  ],
});
</script>

<style>
.app-root {
  position: relative;
  isolation: isolate;
  min-height: 100vh;

  /* 稍微加深背景底色，不再显示网格 */
  background-color: #f5f2fb;
  color: inherit;
}

html.dark .app-root {
  background-color: #141321;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 220ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* 仅保留柔和光晕，不再绘制网格线 */
.site-background {
  position: fixed;
  inset: 0;
  z-index: -1;

  pointer-events: none;

  background-color: #f5f2fb;

  background-image:
    radial-gradient(
      ellipse at 8% 4%,
      rgba(139, 92, 246, 0.18),
      transparent 43%
    ),
    radial-gradient(
      ellipse at 94% 17%,
      rgba(59, 130, 246, 0.13),
      transparent 41%
    ),
    radial-gradient(
      ellipse at 48% 100%,
      rgba(168, 85, 247, 0.065),
      transparent 48%
    );

  opacity: 1;
}

html.dark .site-background {
  background-color: #141321;

  background-image:
    radial-gradient(
      ellipse at 8% 4%,
      rgba(124, 58, 237, 0.22),
      transparent 45%
    ),
    radial-gradient(
      ellipse at 94% 17%,
      rgba(59, 130, 246, 0.15),
      transparent 42%
    ),
    radial-gradient(
      ellipse at 48% 100%,
      rgba(126, 34, 206, 0.09),
      transparent 48%
    );
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
