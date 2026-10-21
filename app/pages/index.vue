
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
                  class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-6"
                >
                  {{ child.desc }}
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
import { ref, onMounted, onUnmounted, watch } from "vue";
import type {
  PageResponse,
  CategoryList,
  Response,
  WebsiteList,
} from "~/lib/type";

const client = useSupabaseClient<WebsiteList>();
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
});

// 点击站点：打开网站并更新访问次数
const handleClick = async (record: WebsiteList) => {
  try {
    window.open(record.url);

    await client.rpc("increment_visit_count", {
      row_id: record.id,
      increment_value: Math.floor(Math.random() * 100) + 1,
    });
  } catch {
    toast.add({
      title: "更新访问次数失败",
      color: "error",
    });
  }
};

definePageMeta({
  title: "拾光导航 | nav-station",
});
</script>
