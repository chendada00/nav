

<template>
  <div
    class="site-image"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  >
    <!-- 加载骨架 -->
    <div
      v-if="isImageUrl && !imageLoaded && !imageError"
      class="site-image-skeleton"
    />

    <!-- 网站图片 -->
    <img
      v-if="isImageUrl && !imageError"
      :key="`${normalizedUrl}-${retryCount}`"
      :src="normalizedUrl"
      :alt="'logo'"
      :width="size"
      :height="size"
      :loading="loading"
      decoding="async"
      :class="['site-image-img', { 'is-loaded': imageLoaded }]"
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- Iconify 图标 -->
    <UIcon
      v-else-if="normalizedUrl && !isImageUrl"
      :name="normalizedUrl"
      :size="String(size)"
      :style="{ color }"
    />

    <!-- 加载失败备用图标 -->
    <UIcon
      v-else-if="normalizedUrl && imageError"
      name="i-lucide-globe"
      :size="String(size)"
      :style="{ color: color || '#94a3b8' }"
    />
  </div>
</template>


<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onBeforeUnmount,
} from 'vue'

type Props = {
  url?: string | null
  size?: number
  color?: string
  loading?: 'lazy' | 'eager'
}

const imageLoaded = ref(false)

// 图片加载成功
const handleImageLoad = () => {
  imageLoaded.value = true
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  size: 40,
  color: '',
  loading: 'lazy',
})

// 标准化图片地址
const normalizedUrl = computed(() => {
  return props.url?.trim() || ''
})

// 判断是否为图片地址
// 不再要求 URL 必须带 jpg、png、ico 等扩展名
const isImageUrl = computed(() => {
  const url = normalizedUrl.value

  return /^https?:\/\//i.test(url) ||
    url.startsWith('/')
})

// 图片加载失败状态
const imageError = ref(false)

// 已经重试次数
const retryCount = ref(0)

// 重试定时器
let retryTimer: ReturnType<typeof setTimeout> | undefined

// 清除重试定时器
const clearRetryTimer = () => {
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = undefined
  }
}

// 图片加载失败处理
const handleImageError = () => {
  clearRetryTimer()

  // 最多重试两次
  if (retryCount.value < 2) {
    const nextRetry = retryCount.value + 1

    // 延迟重试，避免连续请求
    retryTimer = setTimeout(() => {
      // 新一轮重试开始，重新显示加载动画
      imageLoaded.value = false

      retryCount.value = nextRetry
      retryTimer = undefined
    }, nextRetry * 800)

    return
  }

  // 多次失败后显示备用图标
  imageError.value = true
}

// 图片地址变化时，重置状态
watch(normalizedUrl, () => {
  clearRetryTimer()
  retryCount.value = 0
  imageError.value = false
  imageLoaded.value = false
})

// 组件销毁时清理定时器
onBeforeUnmount(() => {
  clearRetryTimer()
})
</script>

<style scoped>
.site-image {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

/* 加载骨架 */
.site-image-skeleton {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: linear-gradient(
    110deg,
    rgba(148, 163, 184, 0.08) 25%,
    rgba(148, 163, 184, 0.2) 50%,
    rgba(148, 163, 184, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* 图片默认透明 */
.site-image-img {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.92);
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* 加载完成后淡入 */
.site-image-img.is-loaded {
  opacity: 1;
  transform: scale(1);
}

/* 骨架流光 */
@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* 尊重系统减少动态效果设置 */
@media (prefers-reduced-motion: reduce) {
  .site-image-skeleton {
    animation: none;
  }

  .site-image-img {
    transition: none;
  }
}
</style>
