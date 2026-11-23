<template>
  <div
    class="site-image"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  >
    <!-- 加载骨架屏：加载中覆盖在最上层，加载完自动移除 -->
    <div
      v-if="isImageUrl && imageStatus === 'loading'"
      class="site-image-skeleton"
    />

    <!-- 图片 -->
    <img
      v-if="isImageUrl && imageStatus !== 'error'"
      ref="imgRef"
      :key="imageKey"
      :src="normalizedUrl"
      alt="logo"
      :width="size"
      :height="size"
      :loading="loading"
      :class="[
        'site-image-img',
        { 'is-loaded': imageStatus === 'loaded' }
      ]"
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

    <!-- 图片加载失败兜底 -->
    <UIcon
      v-else-if="normalizedUrl && imageStatus === 'error'"
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
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue'

type Props = {
  url?: string | null
  size?: number
  color?: string
  loading?: 'lazy' | 'eager'
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  size: 40,
  color: '',
  loading: 'eager', // 图标体积小，默认 eager 避免滚动容器/Tab 中懒加载卡住不渲染
})

const normalizedUrl = computed(() => {
  return props.url?.trim() || ''
})

const isImageUrl = computed(() => {
  const url = normalizedUrl.value
  return /^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('data:image/')
})

type ImageStatus = 'loading' | 'loaded' | 'error'

const imageStatus = ref<ImageStatus>('loading')
const retryCount = ref(0)
const requestSession = ref(0) // 用于隔离每次 URL 切换，防止旧定时器串台

const imageKey = computed(() => {
  return `${requestSession.value}_${normalizedUrl.value}_${retryCount.value}`
})

const imgRef = ref<HTMLImageElement | null>(null)
let retryTimer: ReturnType<typeof setTimeout> | undefined

const clearRetryTimer = () => {
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = undefined
  }
}

/**
 * 检查图片是否已通过浏览器缓存同步完成
 */
const syncCheckImageComplete = () => {
  nextTick(() => {
    const img = imgRef.value
    if (!img) return

    if (img.complete && img.naturalWidth > 0) {
      clearRetryTimer()
      imageStatus.value = 'loaded'
    }
  })
}

/**
 * 图片加载成功
 */
const handleImageLoad = (event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLImageElement)) return

  if (target.naturalWidth <= 0) {
    handleImageError(event)
    return
  }

  clearRetryTimer()
  imageStatus.value = 'loaded'
}

/**
 * 图片加载失败（最多重试 2 次）
 */
const handleImageError = (event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLImageElement)) return

  clearRetryTimer()

  if (retryCount.value < 2) {
    const currentSession = requestSession.value
    const nextRetry = retryCount.value + 1

    retryTimer = setTimeout(() => {
      retryTimer = undefined
      // 如果期间 URL 已经变了，直接丢弃旧重试
      if (requestSession.value !== currentSession) return

      retryCount.value = nextRetry
      imageStatus.value = 'loading'
      syncCheckImageComplete()
    }, nextRetry * 800)

    return
  }

  imageStatus.value = 'error'
}

/**
 * URL 变化时重置状态（flush: 'post' 确保新 <img> 已挂载再检测缓存）
 */
watch(
  normalizedUrl,
  () => {
    clearRetryTimer()
    requestSession.value += 1
    retryCount.value = 0
    imageStatus.value = 'loading'

    if (isImageUrl.value) {
      syncCheckImageComplete()
    }
  },
  {
    immediate: true,
    flush: 'post',
  },
)

onMounted(() => {
  if (isImageUrl.value && imageStatus.value === 'loading') {
    syncCheckImageComplete()
  }
})

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

/* 加载骨架屏 */
.site-image-skeleton {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 10px;
  pointer-events: none;
  background: linear-gradient(
    110deg,
    rgba(148, 163, 184, 0.08) 25%,
    rgba(148, 163, 184, 0.2) 50%,
    rgba(148, 163, 184, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* 图片本体 */
.site-image-img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.01; /* 避免部分浏览器对 opacity:0 元素的渲染优化延迟 */
  transform: scale(0.95);
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.site-image-img.is-loaded {
  opacity: 1;
  transform: scale(1);
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-image-skeleton {
    animation: none;
  }
  .site-image-img {
    transition: none;
    transform: none;
  }
}
</style>