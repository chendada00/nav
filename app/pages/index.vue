
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
                      class="category-tag flex flex-wrap gap-1.5 items-center"
                    >
                      <span
                        v-for="(tag, index) in child.tags"
                        :key="`${child.id}-${index}`"
                        class="category-tag-pill"
                        :style="getTagStyle(tag, child.id, index)"
                      >
                        {{ tag }}
                      </span>
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
                  <div
                    class="site-desc-track"
                    :style="{
                      '--desc-scroll-distance': `${descriptionLoopDistance[child.id] || 0}px`,
                      '--desc-scroll-duration': `${getDescriptionDuration(child.id)}s`,
                    }"
                  >
                    <span class="site-desc-text">
                      {{ child.desc || "" }}
                    </span>

                    <span
                      v-if="(descriptionOverflow[child.id] || 0) > 1"
                      class="site-desc-text"
                      aria-hidden="true"
                    >
                      {{ child.desc || "" }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                class="site-health-corner"
                :class="`site-health-corner--${child.health?.status || 'unknown'}`"
                tabindex="0"
                role="img"
                :aria-label="healthStatusTitle(child.health)"
                @mouseenter="showHealthPopover(child.health, $event)"
                @mouseleave="scheduleHideHealthPopover"
                @focus="showHealthPopover(child.health, $event)"
                @blur="scheduleHideHealthPopover"
              >
                <span class="site-health-corner__triangle" aria-hidden="true" />
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

    <Teleport to="body">
      <div
        v-if="healthPopover"
        class="site-health-popover"
        role="tooltip"
        :style="{
          left: `${healthPopover.left}px`,
          top: `${healthPopover.top}px`,
        }"
        @mouseenter="cancelHideHealthPopover"
        @mouseleave="scheduleHideHealthPopover"
      >
        <div class="site-health-popover__heading">
          <span
            class="site-health-popover__status"
            :class="`site-health-popover__status--${healthPopover.status}`"
          />
          <span>{{ healthPopover.title }}</span>
        </div>

        <div class="site-health-popover__time">
          {{ healthPopover.checkedAt }}
        </div>

        <div class="site-health-popover__details">
          <div class="site-health-popover__row">
            <span>HTTP 状态</span>

            <strong
              class="site-health-popover__http"
              :class="`site-health-popover__http--${healthPopover.status}`"
            >
              {{ healthPopover.httpStatus }}
            </strong>
          </div>

          <div class="site-health-popover__row">
            <span>响应耗时</span>
            <strong>{{ healthPopover.responseTime }}</strong>
          </div>
        </div>

        <div
          v-if="healthPopover.error"
          class="site-health-popover__error"
        >
          {{ healthPopover.error }}
        </div>
      </div>
    </Teleport>
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
  WebsiteHealth,
} from '~/lib/type'

type HealthPopoverState = {
  status: 'up' | 'down' | 'unknown'
  title: string
  checkedAt: string
  httpStatus: string | number
  responseTime: string
  failures: number
  error: string
  left: number
  top: number
}

const healthPopover = ref<HealthPopoverState | null>(null)

let healthPopoverHideTimer: ReturnType<typeof setTimeout> | undefined

const healthStatusTitle = (health?: WebsiteHealth | null) => {
  if (!health || health.status === 'unknown') {
    return health?.consecutive_failures
      ? '检测异常，等待复核'
      : '尚无检测结果'
  }

  return health.status === 'up'
    ? '网站有响应'
    : '网站暂不可达'
}

const healthCheckedAt = (health?: WebsiteHealth | null) => {
  if (!health?.checked_at) return '尚未检测'

  const date = new Date(health.checked_at)

  return Number.isNaN(date.getTime())
    ? '检测时间未知'
    : date.toLocaleString()
}

const healthErrorText = (errorCode?: string | null) => {
  if (!errorCode) return ''

  if (errorCode === 'timeout') return '请求超时'
  if (errorCode === 'dns_error') return '域名解析失败'
  if (errorCode === 'tls_error') return 'HTTPS 连接失败'
  if (errorCode === 'connection_error') return '连接失败'
  if (errorCode === 'private_address') return '目标地址不允许检测'
  if (errorCode === 'invalid_url') return '网址格式无效'
  if (errorCode === 'unsupported_protocol') return '不支持的网址协议'

  if (errorCode.startsWith('http_')) {
    return `服务器返回 HTTP ${errorCode.slice(5)}`
  }

  return '本次检测未成功'
}

const cancelHideHealthPopover = () => {
  if (healthPopoverHideTimer) {
    clearTimeout(healthPopoverHideTimer)
    healthPopoverHideTimer = undefined
  }
}

const scheduleHideHealthPopover = () => {
  cancelHideHealthPopover()

  healthPopoverHideTimer = setTimeout(() => {
    healthPopover.value = null
    healthPopoverHideTimer = undefined
  }, 140)
}

const showHealthPopover = (
  health: WebsiteHealth | null | undefined,
  event: MouseEvent | FocusEvent,
) => {
  cancelHideHealthPopover()

  const target = event.currentTarget

  if (!(target instanceof HTMLElement)) return

  const card = target.closest('.nav-card')
  if (!(card instanceof HTMLElement)) return

  const rect = card.getBoundingClientRect()
  const popoverWidth = 252
  const popoverEstimatedHeight = 158
  const gap = 8

  const left = Math.max(
    12,
    Math.min(rect.left, window.innerWidth - popoverWidth - 12),
  )

  const top = rect.bottom + popoverEstimatedHeight + gap <= window.innerHeight
    ? rect.bottom + gap
    : Math.max(12, rect.top - popoverEstimatedHeight - gap)

  const status = health?.status ?? 'unknown'

  healthPopover.value = {
    status,
    title: healthStatusTitle(health),
    checkedAt: healthCheckedAt(health),
    httpStatus: health?.http_status ?? '—',
    responseTime: health?.response_time_ms != null
      ? `${health.response_time_ms} ms`
      : '—',
    failures: health?.consecutive_failures ?? 0,
    error: healthErrorText(health?.error_code),
    left,
    top,
  }
}

const toast = useToast();

// =========================================
// 网站标签：柔和随机配色
// =========================================

const TAG_COLOR_PALETTE = [
  '125, 153, 225', // 清新蓝
  '130, 177, 160', // 薄荷绿
  '202, 164, 125', // 奶油橙
  '177, 151, 205', // 淡紫色
  '218, 155, 160', // 柔和粉
  '125, 177, 190', // 浅青色
]

// 根据字符串生成稳定哈希值
const getTagHash = (value: string) => {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }

  return Math.abs(hash)
}

// 获取标签颜色
const getTagStyle = (
  tag: string,
  websiteId: number,
  index: number,
) => {
  const hash = getTagHash(`${websiteId}-${tag}-${index}`)

  const color = TAG_COLOR_PALETTE[
    hash % TAG_COLOR_PALETTE.length
  ]

  return {
    '--tag-rgb': color,
  }
}

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
// 两份描述无缝衔接所需的移动距离
const descriptionLoopDistance = ref<Record<string, number>>({});

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

// 滚动速度：每秒移动 80px
const DESCRIPTION_SCROLL_SPEED = 80;

// 根据完整循环距离计算动画时长
const getDescriptionDuration = (id: string | number) => {
  const distance = descriptionLoopDistance.value[id] || 0;

  if (distance <= 1) return 0;

  return distance / DESCRIPTION_SCROLL_SPEED;
};

// 测量描述溢出距离和无缝循环距离
const measureDescription = (id: number) => {
  const elements = descriptionElements.get(id);

  if (!elements) return;

  const { wrapper, text } = elements;

  // 超出容器的距离：决定是否需要滚动
  const overflowDistance = Math.max(
    0,
    text.scrollWidth - wrapper.clientWidth,
  );

  descriptionOverflow.value[id] = overflowDistance;

  // 完整文字宽度 + 两份文字之间的间距
  const gap = 32;

  descriptionLoopDistance.value[id] =
    overflowDistance > 1
      ? text.scrollWidth + gap
      : 0;
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

<style scoped>
/*
 * 左上角状态三角。
 * 不显示圆点，颜色本身表达状态。
 * 卡片本身 overflow:hidden，因此涟漪只在卡片内部扩散。
 */
.nav-card.card-base > .site-health-corner {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;

  width: 42px;
  height: 42px;
  margin: 0;
  padding: 0;

  border: 0;
  border-radius: inherit;
  background: transparent;

  cursor: help;
  outline: none;
}

/* 角标三角形 */
.site-health-corner__triangle {
  position: absolute;
  inset: 0;

  display: block;
  width: 30px;
  height: 30px;

  border-top-left-radius: inherit;
  clip-path: polygon(0 0, 100% 0, 0 100%);

  background: rgba(148, 163, 184, 0.13);
  transition: background-color 180ms ease;
}

.site-health-corner--up .site-health-corner__triangle {
  background: rgba(34, 160, 107, 0.16);
}

.site-health-corner--down .site-health-corner__triangle {
  background: rgba(220, 98, 98, 0.16);
}

.site-health-corner--unknown .site-health-corner__triangle {
  background: rgba(148, 163, 184, 0.13);
}

/*
 * 悬浮涟漪：从左上角三角区域中心向外圆形扩散，正圆，不斜向畸变
 * 三角区域大概位置：(21px,21px) 作为涟漪扩散原点
 */
.site-health-corner::after {
  content: "";
  position: absolute;
  /* 把涟漪圆心定位到三角块中心（30px三角的中心点） */
  top: 15px;
  left: 15px;
  z-index: -1;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transform-origin: center center;
  pointer-events: none;
  transition:
    transform 320ms cubic-bezier(0.21, 0, 0.27, 1),
    opacity 200ms ease;
}

.site-health-corner--up::after {
  background: radial-gradient(
    circle,
    rgba(34, 160, 107, 0.22),
    rgba(34, 160, 107, 0.06) 60%,
    transparent 72%
  );
}
.site-health-corner--down::after {
  background: radial-gradient(
    circle,
    rgba(220, 98, 98, 0.22),
    rgba(220, 98, 98, 0.06) 60%,
    transparent 72%
  );
}
.site-health-corner--unknown::after {
  background: radial-gradient(
    circle,
    rgba(148, 163, 184, 0.20),
    rgba(148, 163, 184, 0.06) 60%,
    transparent 72%
  );
}

.site-health-corner:hover::after,
.site-health-corner:focus-visible::after {
  opacity: 1;
  transform: scale(2.8);
}

/* 暗色主题降低涟漪亮度 */
html.dark .site-health-corner--up::after {
  background: radial-gradient(
    circle,
    rgba(74, 222, 128, 0.20),
    rgba(74, 222, 128, 0.05) 60%,
    transparent 72%
  );
}
html.dark .site-health-corner--down::after {
  background: radial-gradient(
    circle,
    rgba(248, 113, 113, 0.20),
    rgba(248, 113, 113, 0.05) 60%,
    transparent 72%
  );
}

/* =========================================
   网站状态详情卡片
   ========================================= */

/* 卡片主体 */
.site-health-popover {
  position: fixed;
  z-index: 9999;

  width: 252px;
  max-width: calc(100vw - 24px);
  box-sizing: border-box;

  padding: 14px;

  color: #334155;

  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.20);
  border-radius: 14px;

  box-shadow:
    0 12px 34px rgba(15, 23, 42, 0.12),
    0 3px 10px rgba(15, 23, 42, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);

  -webkit-backdrop-filter: blur(18px) saturate(145%);
  backdrop-filter: blur(18px) saturate(145%);

  line-height: 1.5;
  text-align: left;

  pointer-events: auto;

  animation: health-popover-in 180ms
    cubic-bezier(0.22, 1, 0.36, 1);
}

/* 暗色模式 */
html.dark .site-health-popover {
  color: #e2e8f0;

  background: rgba(30, 29, 45, 0.96);
  border-color: rgba(167, 139, 250, 0.19);

  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.28),
    0 3px 10px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

/* 弹出动画 */
@keyframes health-popover-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* =========================================
   状态标题
   ========================================= */

.site-health-popover__heading {
  display: flex;
  align-items: center;
  gap: 9px;

  min-height: 17px;

  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.01em;
}

/* 状态圆点基础样式 */
.site-health-popover__status {
  position: relative;

  flex: 0 0 8px;

  width: 8px;
  height: 8px;

  border-radius: 50%;
  background: #a1a1aa;
}

/* 正常：绿色呼吸 */
.site-health-popover__status--up {
  background: #22a06b;

  animation: health-status-breathe-up 2s ease-in-out infinite;
}

/* 异常：红色呼吸 */
.site-health-popover__status--down {
  background: #dc6262;

  animation: health-status-breathe-down 2s ease-in-out infinite;
}

/* 未知：保持静态 */
.site-health-popover__status--unknown {
  background: #a1a1aa;
}

/* 绿色呼吸动画 */
@keyframes health-status-breathe-up {
  0%,
  100% {
    box-shadow:
      0 0 0 0 rgba(34, 160, 107, 0.30),
      0 0 5px rgba(34, 160, 107, 0.15);
    transform: scale(1);
  }

  50% {
    box-shadow:
      0 0 0 5px rgba(34, 160, 107, 0),
      0 0 9px rgba(34, 160, 107, 0.30);
    transform: scale(1.12);
  }
}

/* 红色呼吸动画 */
@keyframes health-status-breathe-down {
  0%,
  100% {
    box-shadow:
      0 0 0 0 rgba(220, 98, 98, 0.30),
      0 0 5px rgba(220, 98, 98, 0.15);
    transform: scale(1);
  }

  50% {
    box-shadow:
      0 0 0 5px rgba(220, 98, 98, 0),
      0 0 9px rgba(220, 98, 98, 0.30);
    transform: scale(1.12);
  }
}

/* =========================================
   检测时间
   ========================================= */

.site-health-popover__time {
  margin-top: 7px;
  padding-left: 17px;

  color: #94a3b8;

  font-size: 11px;
  line-height: 1.5;
}

html.dark .site-health-popover__time {
  color: #a1a1b5;
}

/* =========================================
   检测详情
   ========================================= */

.site-health-popover__details {
  display: grid;
  gap: 9px;

  margin-top: 12px;
  padding-top: 11px;

  border-top: 1px solid rgba(148, 163, 184, 0.17);
}

html.dark .site-health-popover__details {
  border-top-color: rgba(167, 139, 250, 0.14);
}

.site-health-popover__row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  font-size: 12px;
}

.site-health-popover__row > span {
  color: #94a3b8;
  font-weight: 450;
}

.site-health-popover__row > strong {
  color: inherit;

  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* HTTP 状态胶囊 */
.site-health-popover__http {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 42px;
  padding: 2px 9px;

  border-radius: 999px;

  font-size: 11px;
  font-weight: 650;
}

/* 正常状态 */
.site-health-popover__http--up {
  color: #16845a;
  background: rgba(34, 160, 107, 0.10);
}

/* 异常状态 */
.site-health-popover__http--down {
  color: #cf5555;
  background: rgba(220, 98, 98, 0.10);
}

/* 未知状态 */
.site-health-popover__http--unknown {
  color: #85858f;
  background: rgba(148, 163, 184, 0.12);
}

html.dark .site-health-popover__http--up {
  color: #6ee7a8;
  background: rgba(34, 160, 107, 0.16);
}

html.dark .site-health-popover__http--down {
  color: #fca5a5;
  background: rgba(220, 98, 98, 0.16);
}

html.dark .site-health-popover__http--unknown {
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.15);
}

/* =========================================
   错误信息
   ========================================= */

.site-health-popover__error {
  margin-top: 11px;
  padding: 8px 10px;

  color: #a16262;

  background: rgba(239, 68, 68, 0.065);
  border: 1px solid rgba(239, 68, 68, 0.09);
  border-radius: 9px;

  font-size: 11px;
  line-height: 1.6;

  overflow-wrap: anywhere;
}

html.dark .site-health-popover__error {
  color: #fca5a5;

  background: rgba(239, 68, 68, 0.09);
  border-color: rgba(239, 68, 68, 0.12);
}

/* =========================================
   减少动态效果：尊重系统无障碍设置
   ========================================= */

@media (prefers-reduced-motion: reduce) {
  .site-health-corner::after,
  .site-health-popover,
  .site-health-popover__status {
    animation: none !important;
    transition: none !important;
  }
}

/* =========================================
   网站标签：柔和彩色胶囊
   ========================================= */

.category-tag {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.category-tag-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  max-width: 100%;
  padding: 3px 9px;

  color: rgb(var(--tag-rgb));
  background: rgba(var(--tag-rgb), 0.10);
  border: 1px solid rgba(var(--tag-rgb), 0.17);
  border-radius: 999px;

  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;

  transition:
    background-color 220ms ease,
    border-color 220ms ease,
    transform 220ms ease;
}

/* 暗色模式 */
html.dark .category-tag-pill {
  color: rgb(var(--tag-rgb));
  background: rgba(var(--tag-rgb), 0.15);
  border-color: rgba(var(--tag-rgb), 0.25);
}

/* 鼠标悬停：轻微上浮 */
@media (hover: hover) and (pointer: fine) {
  .category-tag-pill:hover {
    background: rgba(var(--tag-rgb), 0.17);
    border-color: rgba(var(--tag-rgb), 0.30);
    transform: translateY(-1px);
  }

  html.dark .category-tag-pill:hover {
    background: rgba(var(--tag-rgb), 0.23);
    border-color: rgba(var(--tag-rgb), 0.35);
  }
}

/* 减少动态效果 */
@media (prefers-reduced-motion: reduce) {
  .category-tag-pill {
    transition: none;
  }

  .category-tag-pill:hover {
    transform: none;
  }
}
</style>