
<template>
  <!-- 正常加载图片 -->
  <img
    v-if="isImageUrl && !imageError"
    :key="`${normalizedUrl}-${retryCount}`"
    :src="normalizedUrl"
    alt="logo"
    :width="size"
    :height="size"
    :loading="loading"
    decoding="async"
    @error="handleImageError"
  />

  <!-- 原有的 Iconify 图标 -->
  <UIcon
    v-else-if="normalizedUrl && !isImageUrl"
    :name="normalizedUrl"
    :size="String(size)"
    :style="{ color }"
  />

  <!-- 图片最终加载失败时的备用图标 -->
  <UIcon
    v-else-if="normalizedUrl && imageError"
    name="i-lucide-globe"
    :size="String(size)"
    :style="{ color: color || '#94a3b8' }"
  />
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
})

// 组件销毁时清理定时器
onBeforeUnmount(() => {
  clearRetryTimer()
})
</script>
