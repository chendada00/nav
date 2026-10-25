
<template>
  <div>
    <UTooltip text="搜索网站 · Ctrl/⌘ F">
      <UButton
        icon="i-lucide-search"
        color="neutral"
        variant="ghost"
        size="lg"
        aria-label="搜索网站"
        class="search-trigger"
        :ui="{ leadingIcon: '!size-5' }"
        @click="openSearch"
      />
    </UTooltip>

    <Teleport to="body">
      <Transition name="site-search">
        <div
          v-if="isOpen"
          class="site-search-overlay"
          @click.self="closeSearch"
        >
          <section
            class="site-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-search-title"
          >
            <h2 id="site-search-title" class="sr-only">搜索网站</h2>

            <div class="site-search-input-row">
              <UIcon
                name="i-lucide-search"
                class="site-search-search-icon"
              />

              <input
                ref="inputRef"
                v-model="keyword"
                class="site-search-input"
                type="search"
                placeholder="搜索网站、描述、标签或网址..."
                autocomplete="off"
                spellcheck="false"
                aria-label="搜索网站、描述、标签或网址"
                aria-controls="site-search-results-list"
                @keydown="handleInputKeydown"
              />

              <kbd class="site-search-esc" @click="closeSearch">ESC</kbd>
            </div>

            <div class="site-search-hint">
              <span>搜索标题、描述、标签、URL 和分类</span>
              <span v-if="keyword.trim()">
                找到 {{ results.length }} 个结果
              </span>
            </div>

            <div
              id="site-search-results-list"
              class="site-search-results"
            >
              <template v-if="!keyword.trim()">
                <div class="site-search-empty">
                  <UIcon name="i-lucide-sparkles" class="text-2xl" />
                  <p class="font-medium">想找什么网站？</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    输入关键词，即时查找你收藏的网站
                  </p>
                </div>
              </template>

              <template v-else-if="results.length">
                <button
                  v-for="(item, index) in results"
                  :key="item.website.id"
                  :ref="(el) => setResultRef(el, index)"
                  type="button"
                  class="site-search-result"
                  :class="{ 'is-active': selectedIndex === index }"
                  :aria-current="selectedIndex === index ? 'true' : undefined"
                  @mouseenter="selectedIndex = index"
                  @click="openWebsite(item.website.url)"
                >

                  <div class="site-search-logo">
                  <SiteImage
                      :url="item.website.logo"
                      :color="item.website.color"
                      :size="40"
                  />
                  </div>


                  <div class="site-search-result-content">
                    <div class="site-search-result-title">
                      <span>{{ item.website.name }}</span>
                      <UBadge
                        v-if="item.website.pinned"
                        color="primary"
                        variant="soft"
                        size="xs"
                      >
                        置顶
                      </UBadge>
                    </div>

                    <p class="site-search-result-desc">
                      {{ item.website.desc || '暂无描述' }}
                    </p>

                    <div class="site-search-result-meta">
                      <span class="site-search-category">
                        {{ item.categoryName }}
                      </span>
                      <span class="site-search-url">
                        {{ getHostname(item.website.url) }}
                      </span>
                    </div>

                    <div
                      v-if="item.website.tags?.length"
                      class="site-search-tags"
                    >
                      <span
                        v-for="tag in item.website.tags.slice(0, 4)"
                        :key="tag"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>

                  <UIcon
                    name="i-lucide-arrow-up-right"
                    class="site-search-open-icon"
                  />
                </button>
              </template>

              <template v-else>
                <div class="site-search-empty">
                  <UIcon
                    name="i-lucide-search-x"
                    class="text-3xl text-gray-400"
                  />
                  <p class="font-medium">没有找到匹配的网站</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    试试更短的关键词，或搜索网站的域名、标签
                  </p>
                </div>
              </template>
            </div>

            <footer class="site-search-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                选择
                <kbd>↵</kbd>
                打开网站
              </span>
              <span>拾光导航 · 快速搜索</span>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'
import type { CategoryList, WebsiteList, PageResponse, Response } from '~/lib/type'

const isOpen = ref(false)
const keyword = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)

const categories = useState<CategoryList[]>(
  'site-search-categories',
  () => []
)
const dataLoaded = useState<boolean>('site-search-loaded', () => false)

const results = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()

  if (!query) return []

  // 支持输入多个词；每个词都需要在可搜索字段中找到
  const terms = query.split(/\s+/).filter(Boolean)
  const matched: {
    website: WebsiteList
    categoryName: string
  }[] = []

  for (const category of categories.value) {
    for (const website of category.ds_websites ?? []) {
      const searchableText = [
        website.name,
        website.desc,
        website.url,
        getHostname(website.url),
        ...(website.tags ?? []),
        category.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()

      if (terms.every(term => searchableText.includes(term))) {
        matched.push({
          website,
          categoryName: category.name,
        })
      }
    }
  }

  // 置顶站点优先；其余保持首页原有排序
  return matched
    .sort((a, b) => Number(b.website.pinned) - Number(a.website.pinned))
    .slice(0, 30)
})


// 当前键盘选中的搜索结果索引
const selectedIndex = ref(0)

// 保存每个搜索结果按钮的 DOM 引用
const resultRefs: HTMLButtonElement[] = []

function setResultRef(
  el: Element | null,
  index: number,
) {
  if (el instanceof HTMLButtonElement) {
    resultRefs[index] = el
  } else {
    delete resultRefs[index]
  }
}

// 搜索结果变化后，将选中位置重置到第一条
watch(
  results,
  () => {
    selectedIndex.value = 0
  },
)


function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeSearch()
    return
  }

  // 没有搜索结果时，不执行上下选择和跳转
  if (!results.value.length) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    selectedIndex.value =
      (selectedIndex.value + 1) % results.value.length

    scrollSelectedIntoView()
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    selectedIndex.value =
      (selectedIndex.value - 1 + results.value.length)
      % results.value.length

    scrollSelectedIntoView()
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()

    const selected = results.value[selectedIndex.value]

    if (selected?.website.url) {
      openWebsite(selected.website.url)
    }
  }
}

function scrollSelectedIntoView() {
  nextTick(() => {
    resultRefs[selectedIndex.value]?.scrollIntoView({
      block: 'nearest',
      behavior: 'auto',
    })
  })
}

function getHostname(url: string) {
  try {
    return new URL(
      url.startsWith('http') ? url : `https://${url}`
    ).hostname
  } catch {
    return url
  }
}


async function openSearch() {
  isOpen.value = true

  // 搜索组件也可在非首页页面使用；首次打开时再加载数据
  if (!dataLoaded.value && !isLoading.value) {
    isLoading.value = true

    try {
      const response = await $fetch<Response<PageResponse<CategoryList>>>(
        '/api/home'
      )
      categories.value = response.data?.list ?? []
      dataLoaded.value = true
    } catch (error) {
      console.error('搜索数据加载失败', error)
    } finally {
      isLoading.value = false
    }
  }

  await nextTick()
  inputRef.value?.focus()
}

function closeSearch() {
  isOpen.value = false
  keyword.value = ''
}

function openWebsite(url: string) {
  if (!url) return

  const target = /^https?:\/\//i.test(url) ? url : `https://${url}`
  window.open(target, '_blank', 'noopener,noreferrer')
  closeSearch()
}

function handleGlobalKeydown(event: KeyboardEvent) {
  const isShortcut = event.ctrlKey || event.metaKey
  const key = event.key.toLowerCase()

  // Ctrl+F / Cmd+F：屏蔽浏览器查找，打开导航搜索
  if (isShortcut && key === 'f') {
    event.preventDefault()

    if (!isOpen.value) {
      void openSearch()
    } else {
      inputRef.value?.focus()
    }

    return
  }

  // 保留原有 Ctrl+K / Cmd+K 快捷键
  if (isShortcut && key === 'k') {
    event.preventDefault()

    if (!isOpen.value) {
      void openSearch()
    } else {
      inputRef.value?.focus()
    }

    return
  }

  // 搜索框关闭时，Esc 不影响其他页面行为
  if (event.key === 'Escape' && isOpen.value) {
    closeSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.search-trigger {
  flex: none;
}

.site-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: min(12vh, 96px) 16px 24px;
  background: rgb(15 23 42 / 42%);
  backdrop-filter: blur(8px);
}

.site-search-dialog {
  width: min(100%, 640px);
  max-height: min(76vh, 720px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 28%);
  border-radius: 20px;
  background: #fff;
  color: #0f172a;
  box-shadow: 0 24px 80px rgb(0 0 0 / 24%);
}

:global(.dark) .site-search-dialog {
  background: #111827;
  color: #f8fafc;
  border-color: rgb(148 163 184 / 22%);
}

.site-search-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 68px;
  padding: 0 20px;
  border-bottom: 1px solid rgb(148 163 184 / 22%);
}

.site-search-search-icon {
  flex: none;
  width: 22px;
  height: 22px;
  color: #64748b;
}

.site-search-input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: 16px;
}

.site-search-input::placeholder {
  color: #94a3b8;
}

.site-search-esc,
.site-search-footer kbd {
  flex: none;
  padding: 3px 6px;
  border: 1px solid rgb(148 163 184 / 35%);
  border-radius: 6px;
  color: #64748b;
  font-size: 11px;
  cursor: pointer;
}

.site-search-hint {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 20px;
  color: #64748b;
  font-size: 12px;
}

.site-search-results {
  min-height: 160px;
  overflow-y: auto;
  padding: 4px 10px 12px;
}

.site-search-result {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.site-search-result:hover,
.site-search-result:focus-visible,
.site-search-result.is-active {
  border-color: rgb(139 92 246 / 45%);
  background: rgb(139 92 246 / 10%);
  outline: none;
}

.site-search-result.is-active {
  box-shadow: inset 3px 0 0 #8b5cf6;
}

:global(.dark) .site-search-result:hover,
:global(.dark) .site-search-result:focus-visible,
:global(.dark) .site-search-result.is-active {
  border-color: rgb(167 139 250 / 45%);
  background: rgb(167 139 250 / 12%);
}

.site-search-logo {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  background: transparent;
}

.site-search-logo :deep(img) {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.site-search-result-content {
  flex: 1;
  min-width: 0;
}

.site-search-result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 650;
}

.site-search-result-desc {
  margin-top: 4px;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark) .site-search-result-desc {
  color: #9ca3af;
}

.site-search-result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
  font-size: 11px;
}

.site-search-category {
  color: #0d9488;
}

.site-search-url {
  overflow: hidden;
  color: #94a3b8;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
}

.site-search-tags span {
  padding: 2px 7px;
  border-radius: 999px;
  background: rgb(148 163 184 / 12%);
  color: #64748b;
  font-size: 10px;
}

.site-search-open-icon {
  flex: none;
  width: 16px;
  height: 16px;
  margin-top: 4px;
  color: #94a3b8;
}

.site-search-empty {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 16px;
  text-align: center;
}

.site-search-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-top: 1px solid rgb(148 163 184 / 22%);
  color: #94a3b8;
  font-size: 11px;
}

.site-search-footer span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.site-search-enter-active,
.site-search-leave-active {
  transition: opacity 150ms ease;
}

.site-search-enter-active .site-search-dialog,
.site-search-leave-active .site-search-dialog {
  transition: transform 150ms ease;
}

.site-search-enter-from,
.site-search-leave-to {
  opacity: 0;
}

.site-search-enter-from .site-search-dialog,
.site-search-leave-to .site-search-dialog {
  transform: translateY(-8px) scale(0.99);
}

@media (max-width: 520px) {
  .site-search-overlay {
    padding: 10vh 10px 16px;
  }

  .site-search-dialog {
    max-height: 82vh;
    border-radius: 16px;
  }

  .site-search-input-row {
    min-height: 60px;
    padding: 0 14px;
  }

  .site-search-result {
    gap: 10px;
    padding: 10px 8px;
  }

  .site-search-logo {
    width: 36px;
    height: 36px;
  }

  .site-search-footer span:last-child {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-search-result,
  .site-search-enter-active,
  .site-search-leave-active,
  .site-search-enter-active .site-search-dialog,
  .site-search-leave-active .site-search-dialog {
    transition: none;
  }
}
</style>
