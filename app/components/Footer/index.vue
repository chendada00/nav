<template>
  <footer
    class="mt-8 border-t border-gray-200/70 px-4 py-4 text-sm text-gray-500 dark:border-gray-700/70 dark:text-gray-400"
  >
    <div
      class="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-3 sm:grid-cols-3 sm:gap-4"
    >
      <!-- 左侧：Powered by 伴随 -->
      <div class="flex items-center justify-center sm:justify-start">
        <span
          class="font-medium text-violet-600 dark:text-violet-300"
        >
          Powered by&nbsp;
        </span>

        <a
          href="https://www.xn--xpqp35o.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-gray-700 transition-colors hover:text-violet-600 dark:text-gray-200 dark:hover:text-violet-300"
        >
          伴随
        </a>
      </div>
      <!-- 中间：备案号 -->
      <div class="flex items-center justify-center">
        <a
          href="https://beian.miit.gov.cn/#/Integrated/index"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-primary-500 dark:hover:text-primary-400"
        >
          京ICP备2022017849号-3
        </a>
      </div>

      <!-- 右侧：分类数、网站数 -->
      <div class="flex items-center justify-center gap-4 sm:justify-end">
        <span class="whitespace-nowrap">
          分类
          <strong class="font-semibold text-gray-700 dark:text-gray-200">
            {{ categoryCount }}
          </strong>
        </span>

        <span class="whitespace-nowrap">
          网站
          <strong class="font-semibold text-gray-700 dark:text-gray-200">
            {{ websiteCount }}
          </strong>
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  CategoryList,
  PageResponse,
  Response,
} from '~/lib/type'

const { data } = await useFetch<Response<PageResponse<CategoryList>>>(
  '/api/home',
  {
    key: 'footer-navigation-stats',
  },
)

const categories = computed(() => data.value?.data?.list ?? [])

const categoryCount = computed(() => categories.value.length)

const websiteCount = computed(() =>
  categories.value.reduce(
    (total, category) => total + (category.ds_websites?.length ?? 0),
    0,
  ),
)
</script>