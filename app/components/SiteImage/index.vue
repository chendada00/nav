
<template>
  <div
    class="site-image"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  >
    <!-- 图片加载动画 -->
    <div
      v-if="isImageUrl && imageStatus === 'loading'"
      class="site-image-skeleton"
    />

    <!-- 网站图片 -->
    <img
      v-if="isImageUrl && imageStatus !== 'error'"
      ref="imgRef"
      :key="requestKey"
      :src="normalizedUrl"
      :alt="'logo'"
      :width="size"
      :height="size"
      :loading="loading"
      decoding="async"
      :data-request-key="requestKey"
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

    <!-- 图片加载失败备用图标 -->
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
  onBeforeUnmount,
  nextTick,
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

// 标准化图片地址
const normalizedUrl = computed(() => {
  return props.url?.trim() || ''
})

// 判断是否为图片地址
const isImageUrl = computed(() => {
  const url = normalizedUrl.value

  return /^https?:\/\//i.test(url) ||
    url.startsWith('/')
})

// 图片状态
type ImageStatus = 'loading' | 'loaded' | 'error'

const imageStatus = ref<ImageStatus>('loading')

// 已重试次数
const retryCount = ref(0)

// 当前图片请求标识
const requestKey = computed(() => {
  return `${normalizedUrl.value}-${retryCount.value}`
})

// 定义 img 元素的模板引用（安全获取 DOM，避免使用 document.querySelector）
const imgRef = ref<HTMLImageElement | null>(null)

// 重试定时器
let retryTimer: ReturnType<typeof setTimeout> | undefined

// 清理定时器
const clearRetryTimer = () => {
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = undefined
  }
}

// 图片加载成功
const handleImageLoad = () => {
  clearRetryTimer()
  imageStatus.value = 'loaded'
}

// 图片加载失败
const handleImageError = () => {
  clearRetryTimer()

  // 最多重试两次
  if (retryCount.value < 2) {
    const nextRetry = retryCount.value + 1
    const currentUrl = normalizedUrl.value

    // 延迟重试：800ms、1600ms
    retryTimer = setTimeout(() => {
      retryTimer = undefined

      if (normalizedUrl.value !== currentUrl) return

      imageStatus.value = 'loading'
      retryCount.value = nextRetry
    }, nextRetry * 800)

    return
  }

  // 多次失败后显示备用图标
  imageStatus.value = 'error'
}

// 检查浏览器缓存：利用模板引用安全检查 complete 状态
const checkImageComplete = () => {
  nextTick(() => {
    if (imgRef.value && imgRef.value.complete) {
      if (imgRef.value.naturalWidth > 0) {
        handleImageLoad()
      } else {
        handleImageError()
      }
    }
  })
}

// 图片地址变化时，重置所有状态
watch(
  normalizedUrl,
  () => {
    clearRetryTimer()
    retryCount.value = 0
    imageStatus.value = 'loading'
    checkImageComplete()
  },
  { immediate: true }
)

// 重试时也检查一遍缓存
watch(retryCount, () => {
  checkImageComplete()
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

/* 图片加载成功后淡入 */
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
