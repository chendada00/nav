
<template>
  <div class="container mx-auto flex flex-col gap-6">
    <template v-if="categoryStatus === 'pending'">
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-20 w-full"
      />
    </template>

    <template v-else>
      <div
        v-for="item in categoryList?.data?.list || []"
        :key="item.id"
        class="category-section"
      >
        <!-- 分类标题：点击后折叠或展开 -->
        <div
          class="category-heading group"
          :class="{ 'is-collapsed': collapsedStates[item.id] }"
          @click="toggleCategory(item.id)"
        >
          <span class="category-icon-wrap">
            <UIcon
              :name="item.icon || 'ri:menu-5-line'"
              class="category-icon !size-5"
            />
          </span>

          <span class="category-title">
            {{ item.name }}
          </span>

          <span class="category-count">
            {{ item.ds_websites?.length || 0 }}
          </span>

          <span class="category-divider"></span>

          <span class="category-chevron">
            <UIcon
              name="lucide:chevron-down"
              class="!size-4"
            />
          </span>
        </div>

        <!-- 站点卡片网格 -->
        <div
          v-if="item.ds_websites?.length && !collapsedStates[item.id]"
          class="site-grid"
        >
          <div
            v-for="child in item.ds_websites || []"
            :key="child.id"
            class="site-grid-item"
          >
            <div
              class="nav-card card-base group relative h-full cursor-pointer"
              @click="handleClick(child)"
            >
              <div class="flex flex-col gap-3">
                <div class="flex gap-2 items-center">
                  <SiteImage
                    :url="child.logo"
                    :color="child.color"
                    loading="lazy"
                  />

                  <div class="flex flex-col gap-0.5 min-w-0">
                    <div class="flex gap-1 items-center min-w-0">
                      <div class="nav-card-title text-lg font-semibold">
                        {{ child.name }}
                      </div>

                      <template v-if="child.vpn">
                        <UTooltip text="访问需要开启 VPN 服务">
                          <UIcon
                            name="ri:error-warning-line"
                            class="text-slate-400"
                          />
                        </UTooltip>
                      </template>
                    </div>

                    <div
                      class="category-tag flex flex-wrap gap-1 items-center text-xs text-slate-400 font-thin"
                    >
                      <template
                        v-for="(tag, index) in child.tags"
                        :key="index"
                      >
                        <UBadge
                          color="neutral"
                          variant="soft"
                          class="rounded-full"
                          size="sm"
                        >
                          {{ tag }}
                        </UBadge>
                      </template>
                    </div>
                  </div>
                </div>

                <div
                  :ref="(el) => registerDescription(el, child.id)"
                  class="site-desc-wrap"
                  :class="{
                    'is-overflowing': (descriptionOverflow[child.id] || 0) > 1,
                  }"
                >
                  <span
                    class="site-desc-text"
                    :style="{
                      '--desc-scroll-distance': `${descriptionOverflow[child.id] || 0}px`,
                      '--desc-scroll-duration': `${getDescriptionDuration(child.id)}s`,
                    }"
                  >
                    {{ child.desc || "" }}
                  </span>
                </div>
              </div>

              <div class="flex gap-1 absolute top-2 right-2">
                <UBadge
                  v-if="child.pinned"
                  variant="soft"
                  size="sm"
                >
                  置顶
                </UBadge>

                <UBadge
                  v-if="child.recommend"
                  color="secondary"
                  variant="soft"
                  size="sm"
                >
                  推荐
                </UBadge>
              </div>
            </div>
          </div>
        </div>

        <div
          v-show="!collapsedStates[item.id]"
          v-else
          class="flex justify-center items-center flex-col"
        >
          <UAlert
            color="neutral"
            variant="subtle"
            title="此分类暂无站点!"
            description="请前往后台添加数据."
            icon="i-lucide-terminal"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";

import type {
  PageResponse,
  CategoryList,
  Response,
  WebsiteList,
} from "~/lib/type";

const toast = useToast();

// 每个分类独立保存折叠状态
const collapsedStates = ref<Record<number, boolean>>({});

// 请求首页分类和站点列表
const {
  data: categoryList,
  status: categoryStatus,
} = await useFetch<Response<PageResponse<CategoryList>>>(
  "/api/home",
  {
    onRequestError: ({ error }) => {
      toast.add({
        title: "请求失败.",
        description: error.message,
      });
    },
  },
);



// 网站描述的 DOM 引用与溢出距离
const descriptionOverflow = ref<Record<string, number>>({});

const descriptionElements = new Map<
  string,
  { wrapper: HTMLElement; text: HTMLElement }
>();

let descriptionObserver: ResizeObserver | null = null;
const registerDescription = (
  el: Element | null,
  id: number,
) => {
  const previous = descriptionElements.get(id);

  if (!(el instanceof HTMLElement)) {
    if (previous) {
      descriptionObserver?.unobserve(previous.wrapper);
      descriptionElements.delete(id);
    }

    delete descriptionOverflow.value[id];
    return;
  }

  const text = el.querySelector<HTMLElement>(
    ".site-desc-text",
  );

  if (!text) return;

  if (previous && previous.wrapper !== el) {
    descriptionObserver?.unobserve(previous.wrapper);
  }

  descriptionElements.set(id, {
    wrapper: el,
    text,
  });

  descriptionObserver?.observe(el);

  void nextTick(() => measureDescription(id));
};

// 描述滚动速度：每秒约 100px，限制单程时长
const getDescriptionDuration = (id: string | number) => {
  const distance = descriptionOverflow.value[id] || 0;

  if (distance <= 1) return 0;

  return Math.min(5, Math.max(1.2, distance / 100));
};

// 精确计算文字超出容器的距离
const measureDescription = (id: number) => {
  const elements = descriptionElements.get(id);

  if (!elements) return;

  const { wrapper, text } = elements;
  const distance = Math.max(
    0,
    text.scrollWidth - wrapper.clientWidth,
  );

  descriptionOverflow.value[id] = distance;
};

// 重新测量所有描述
const measureAllDescriptions = async () => {
  await nextTick();

  for (const id of descriptionElements.keys()) {
    measureDescription(id);
  }
};

// 监听窗口尺寸、网格宽度变化
onMounted(() => {
  descriptionObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      for (const [id, elements] of descriptionElements) {
        if (elements.wrapper === entry.target) {
          measureDescription(id);
          break;
        }
      }
    }
  });

  for (const elements of descriptionElements.values()) {
    descriptionObserver.observe(elements.wrapper);
  }

  measureAllDescriptions();
});

// 数据更新后重新计算，兼容搜索数据刷新等情况
watch(
  () => categoryList.value?.data?.list,
  () => {
    measureAllDescriptions();
  },
  { deep: true },
);


// 将首页站点数据共享给顶部搜索组件
const siteSearchCategories = useState<CategoryList[]>(
  "site-search-categories",
  () => [],
);

const siteSearchLoaded = useState<boolean>(
  "site-search-loaded",
  () => false,
);

watch(
  () => categoryList.value?.data?.list,
  (list) => {
    if (list) {
      siteSearchCategories.value = list;
      siteSearchLoaded.value = true;
    }
  },
  { immediate: true },
);

// 初始化所有分类的折叠状态
const initializeCollapseState = (
  collapseStatus: boolean | null = null,
) => {
  const list = categoryList.value?.data?.list;

  if (!list) return;

  const initialCollapse =
    collapseStatus !== null ? collapseStatus : false;

  list.forEach((category) => {
    collapsedStates.value[category.id] = initialCollapse;
  });

  if (collapseStatus === null) {
    localStorage.setItem("globalCollapseState", "false");
  }
};

// 切换单个分类
const toggleCategory = (categoryId: number) => {
  if (!(categoryId in collapsedStates.value)) return;

  collapsedStates.value[categoryId] =
    !collapsedStates.value[categoryId];

  localStorage.setItem("globalCollapseState", "false");
};

// 供布局中的全局折叠按钮调用
const toggleAllCategories = (collapse: boolean) => {
  initializeCollapseState(collapse);

  localStorage.setItem(
    "globalCollapseState",
    collapse ? "true" : "false",
  );
};

// 同步其他页面或标签页的全局折叠状态
const handleStorageChange = (event: StorageEvent) => {
  if (
    event.key === "globalCollapseState" &&
    event.newValue !== null
  ) {
    const isCollapsed = event.newValue === "true";

    const allCollapsed = Object.values(
      collapsedStates.value,
    ).every((state) => state);

    if (isCollapsed !== allCollapsed) {
      initializeCollapseState(isCollapsed);
    }
  }
};

onMounted(() => {
  if (process.client) {
    const savedState = localStorage.getItem(
      "globalCollapseState",
    );

    if (savedState !== null) {
      initializeCollapseState(savedState === "true");
    } else {
      initializeCollapseState();
    }

    window.addEventListener(
      "storage",
      handleStorageChange,
    );
  }
});

onUnmounted(() => {
  window.removeEventListener(
    "storage",
    handleStorageChange,
  );

  descriptionObserver?.disconnect();
  descriptionObserver = null;
  descriptionElements.clear();
});

const handleClick = (record: WebsiteList) => {
  window.open(record.url, "_blank", "noopener,noreferrer");
};

definePageMeta({
  title: "拾光导航 | nav-station",
});
</script>
