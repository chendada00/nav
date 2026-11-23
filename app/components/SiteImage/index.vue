<template>
  <div
    class="site-image"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  >
    <!-- 加载动画 -->
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
      :data-src="normalizedUrl"
      alt="logo"
      :width="size"
      :height="size"
      :loading="loading"
      decoding="async"
      :class="[
        'site-image-img',
        { 'is-loaded': imageStatus === 'loaded' }
      ]"
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- Iconify -->
    <UIcon
      v-else-if="normalizedUrl && !isImageUrl"
      :name="normalizedUrl"
      :size="String(size)"
      :style="{ color }"
    />

    <!-- 图片加载失败 -->
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
  loading: 'lazy',
})

const normalizedUrl = computed(() => {
  return props.url?.trim() || ''
})

const isImageUrl = computed(() => {
  const url = normalizedUrl.value

  return /^https?:\/\//i.test(url) || url.startsWith('/')
})

type ImageStatus = 'loading' | 'loaded' | 'error'

const imageStatus = ref<ImageStatus>('loading')
const retryCount = ref(0)

/**
 * 图片实例标识
 * URL + 重试次数
 */
const imageKey = computed(() => {
  return `${normalizedUrl.value}_${retryCount.value}`
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
 * 获取当前事件图片
 * 只校验 DOM 实例和图片地址
 */
const getCurrentImage = (event: Event) => {
  const target = event.target

  if (!(target instanceof HTMLImageElement)) {
    return null
  }

  if (target !== imgRef.value) {
    return null
  }

  if (target.dataset.src !== normalizedUrl.value) {
    return null
  }

  return target
}

/**
 * 图片加载成功
 */
const handleImageLoad = (event: Event) => {
  const img = getCurrentImage(event)

  if (!img) return

  if (img.naturalWidth <= 0) return

  clearRetryTimer()

  imageStatus.value = 'loaded'
}

/**
 * 图片加载失败
 */
const handleImageError = (event: Event) => {
  const img = getCurrentImage(event)

  if (!img) return

  clearRetryTimer()

  // 最多重试两次
  if (retryCount.value < 2) {
    const currentUrl = normalizedUrl.value
    const nextRetry = retryCount.value + 1

    retryTimer = setTimeout(() => {
      retryTimer = undefined

      // URL 已改变，放弃旧重试
      if (normalizedUrl.value !== currentUrl) {
        return
      }

      retryCount.value = nextRetry
      imageStatus.value = 'loading'
    }, nextRetry * 800)

    return
  }

  imageStatus.value = 'error'
}

/**
 * 检查已经完成的图片
 *
 * 这里只把确定成功的图片切换为 loaded
 * 不使用 complete && naturalWidth === 0
 * 判断失败，避免干扰懒加载
 */
const checkImageLoaded = () => {
  nextTick(() => {
    const img = imgRef.value

    if (!img) return

    if (img.dataset.src !== normalizedUrl.value) {
      return
    }

    if (img.complete && img.naturalWidth > 0) {
      clearRetryTimer()
      imageStatus.value = 'loaded'
    }
  })
}

/**
 * URL变化时重置状态
 */
watch(
  normalizedUrl,
  () => {
    clearRetryTimer()

    retryCount.value = 0
    imageStatus.value = 'loading'

    checkImageLoaded()
  },
  {
    immediate: true,
  },
)

/**
 * 重试后检查图片缓存
 */
watch(retryCount, () => {
  checkImageLoaded()
})

/**
 * 组件销毁
 */
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

/* 加载动画 */
.site-image-skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
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

/* 图片默认隐藏 */
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

/* 加载完成 */
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

/* 减少动态效果 */
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