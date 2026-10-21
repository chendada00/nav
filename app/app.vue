<template>
  <div class="relative">
    <div class="site-background" aria-hidden="true"></div>
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
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  meta: [
    { name: "keywords", content: "拾光导航,网址导航,效率工具,网站收藏" },
    { name: "description", content: "拾光导航（nav-station），轻量、简洁的个人网址导航。" },
  ],
});
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.site-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--ui-border) 28%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--ui-border) 28%, transparent) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.22;
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
