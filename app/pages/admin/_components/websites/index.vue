<template>
  <div class="flex flex-col gap-4">
    <!-- 顶部搜索和操作 -->
    <div class="flex flex-wrap justify-between items-center gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="name"
          placeholder="输入站点名称搜索"
          class="w-60"
          @keyup.enter="handleSearch"
        />

        <USelect
          v-model="category_id"
          placeholder="全部分类"
          value-key="id"
          label-key="name"
          :loading="categoryLoading === 'pending'"
          :items="categoryData?.data?.list || []"
          :clearable="true"
          class="w-60"
        />

        <UButton
          icon="ri:search-line"
          size="md"
          variant="solid"
          class="cursor-pointer"
          :loading="status === 'pending'"
          @click="handleSearch"
        >
          查询
        </UButton>

        <UButton
          icon="ri:reset-left-line"
          size="md"
          variant="outline"
          color="neutral"
          class="cursor-pointer"
          @click="handleReset"
        >
          重置
        </UButton>

        <UButton
          icon="ri:add-line"
          size="md"
          color="secondary"
          variant="solid"
          class="cursor-pointer"
          @click="handleAdd"
        >
          新增
        </UButton>
      </div>

      <!-- 列控制项 -->
      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: columnVisibilityMap[column.id] || column.id,
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked);
              },
              onSelect(e?: Event) {
                e?.preventDefault();
              },
            }))
        "
        :content="{ align: 'end' }"
      >
        <UButton
          label="Columns"
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-chevron-down"
          class="bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
        />
      </UDropdownMenu>
    </div>

    <!-- 表格列表 -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <UTable
        ref="table"
        :loading="status === 'pending'"
        :data="data?.data?.list || []"
        :columns="columns"
        v-model:column-pinning="columnPinning"
        v-model:column-visibility="columnVisibility"
        :ui="{
          th: 'border border-gray-200 dark:border-gray-700',
          td: 'border border-gray-200 dark:border-gray-700',
        }"
      />
    </div>

    <!-- 分页 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ data?.data?.total || 0 }} 条
        </span>

        <USelect
          :model-value="pageSize"
          :items="pageSizeOptions"
          value-key="value"
          label-key="label"
          size="sm"
          class="w-32"
          @update:model-value="handlePageSizeChange"
        />
      </div>

      <UPagination
        v-model:page="current"
        :items-per-page="pageSize"
        :total="data?.data?.total || 0"
        show-edges
        @update:page="handlePageChange"
      />
    </div>

    <!-- 编辑模态框 -->
    <EditModal
      v-model="showEditModal"
      :website="currentWebsite"
      :category-list="categoryData?.data?.list || []"
      @success="handleSuccess"
    />

    <!-- 删除确认模态框 -->
    <UModal
      v-model:open="showDeleteModal"
      :dismissible="false"
      :ui="{
        content: 'sm:max-w-md',
        footer: 'justify-end gap-2',
      }"
    >
      <template #content>
        <div class="p-6">
          <!-- 图标和标题 -->
          <div class="flex flex-col items-center text-center">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40"
            >
              <UIcon
                name="ri:delete-bin-line"
                class="h-7 w-7 text-red-500"
              />
            </div>

            <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              确认删除网站？
            </h3>

            <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              此操作无法撤销，请确认是否删除该网站。
            </p>
          </div>

          <!-- 网站信息 -->
          <div
            v-if="deleteTarget"
            class="mt-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-700">
              <UIcon
                name="ri:global-line"
                class="h-5 w-5 text-gray-500 dark:text-gray-300"
              />
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ deleteTarget.name }}
              </p>
              <p class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                {{ deleteTarget.url }}
              </p>
            </div>
          </div>

          <!-- 提示 -->
          <div class="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-950/30">
            <UIcon
              name="ri:error-warning-line"
              class="mt-0.5 h-4 w-4 shrink-0 text-red-500"
            />
            <p class="text-xs leading-5 text-red-600 dark:text-red-400">
              删除后，该网站将从导航列表中移除，且无法通过此操作恢复。
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-6 flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              :disabled="deleteId !== ''"
              class="cursor-pointer"
              @click="closeDeleteModal"
            >
              取消
            </UButton>

            <UButton
              color="error"
              variant="solid"
              icon="ri:delete-bin-line"
              :loading="deleteId !== ''"
              :disabled="!deleteTarget || deleteId !== ''"
              class="cursor-pointer"
              @click="confirmDelete"
            >
              确认删除
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type {
  PageResponse,
  WebsiteList,
  Response,
  WebsiteEdit,
  CategoryList,
} from "~/lib/type";
import { RESPONSE_STATUS_CODE } from "~/lib/enum";
import type { TableColumn } from "@nuxt/ui";
import EditModal from "./components/EditModal.vue";
import { pick } from "~/lib/utils";
import SiteImage from "~/components/SiteImage/index.vue";

const UBadge = resolveComponent("UBadge");
const UIcon = resolveComponent("UIcon");
const UButton = resolveComponent("UButton");
const UCheckbox = resolveComponent("UCheckbox");

const dayjs = useDayjs();
const toast = useToast();

// 请求参数
const current = ref(1);
const pageSize = ref(10);
const name = ref("");
const category_id = ref("");

// 每页条数选项
const pageSizeOptions = [
  { label: "10 条/页", value: 10 },
  { label: "20 条/页", value: 20 },
  { label: "50 条/页", value: 50 },
  { label: "100 条/页", value: 100 },
];

// 删除状态
const deleteId = ref("");

// 删除确认弹窗
const showDeleteModal = ref(false);
const deleteTarget = ref<WebsiteList | null>(null);

// 从 localStorage 恢复状态
const restoreState = () => {
  const savedState = localStorage.getItem("websiteFilterStateWebsites");

  if (savedState) {
    try {
      const state = JSON.parse(savedState);

      name.value = state.name || "";
      category_id.value = state.category_id || "";
      current.value = Math.max(1, Number(state.current) || 1);

      const savedPageSize = Number(state.pageSize);

      pageSize.value = [10, 20, 50, 100].includes(savedPageSize)
        ? savedPageSize
        : 10;
    } catch {
      localStorage.removeItem("websiteFilterStateWebsites");
    }
  }
};

// 保存状态到 localStorage
const saveState = () => {
  const state = {
    name: name.value,
    category_id: category_id.value,
    current: current.value,
    pageSize: pageSize.value,
  };

  localStorage.setItem(
    "websiteFilterStateWebsites",
    JSON.stringify(state)
  );
};

// 页面加载时恢复状态
onMounted(async () => {
  restoreState();
  await refresh();
});

// 状态变化时保存
watch([name, category_id, current, pageSize], () => {
  saveState();
});

// 分类筛选变化时回到第一页
watch(category_id, () => {
  current.value = 1;
});

// 请求分类列表
const {
  data: categoryData,
  status: categoryLoading,
} = await useFetch<Response<PageResponse<CategoryList>>>(
  "/api/categorys",
  {
    query: { current: 1, pageSize: 9999 },
  }
);

// 请求网站列表
const {
  data,
  refresh,
  status,
} = await useFetch<Response<PageResponse<WebsiteList>>>(
  "/api/websites",
  {
    query: {
      current,
      pageSize,
      name,
      category_id,
    },
    watch: [current, pageSize, name, category_id],
    onResponse: ({ response }) => {
      const { code, msg } = response._data;

      if (code !== RESPONSE_STATUS_CODE.SUCCESS) {
        toast.add({
          title: msg,
        });
      }
    },
  }
);

// 查询回调
const handleSearch = async () => {
  current.value = 1;
  await refresh();
  saveState();
};

// 编辑模态框状态
const showEditModal = ref(false);
const currentWebsite = ref<WebsiteEdit | null>(null);

// 重置回调
const handleReset = async () => {
  current.value = 1;
  name.value = "";
  category_id.value = "";
  currentWebsite.value = null;

  await refresh();
  saveState();
};

// 分页切换回调
const handlePageChange = async (page: number) => {
  current.value = page;
  await refresh();
  saveState();
};

// 修改每页条数
const handlePageSizeChange = (value: number) => {
  const newSize = Number(value);

  if (![10, 20, 50, 100].includes(newSize)) {
    return;
  }

  pageSize.value = newSize;
  current.value = 1;
  saveState();
};

// 新增回调
const handleAdd = () => {
  currentWebsite.value = null;
  showEditModal.value = true;
};

// 编辑回调
const handleEdit = (category: WebsiteList) => {
  currentWebsite.value = pick(category, [
    "id",
    "category_id",
    "name",
    "url",
    "logo",
    "tags",
    "pinned",
    "vpn",
    "recommend",
    "commonlyUsed",
    "color",
    "desc",
    "sort",
  ]);

  showEditModal.value = true;
};

// 打开删除确认框
const handleDelete = (website: WebsiteList) => {
  if (deleteId.value) return;

  deleteTarget.value = website;
  showDeleteModal.value = true;
};

// 关闭删除确认框
const closeDeleteModal = () => {
  if (deleteId.value) return;

  showDeleteModal.value = false;
  deleteTarget.value = null;
};

// 确认删除
const confirmDelete = async () => {
  const website = deleteTarget.value;

  if (!website || deleteId.value) return;

  deleteId.value = website.id;

  try {
    const { code, msg } = await $fetch("/api/websites", {
      method: "DELETE",
      body: {
        id: website.id,
      },
    });

    if (code === RESPONSE_STATUS_CODE.SUCCESS) {
      showDeleteModal.value = false;
      deleteTarget.value = null;

      toast.add({
        title: "删除成功",
        color: "success",
        icon: "ri:checkbox-circle-line",
      });

      // 如果当前页只有一条数据，删除后返回上一页
      const currentList = data.value?.data?.list || [];

      if (currentList.length === 1 && current.value > 1) {
        current.value -= 1;
      }

      await refresh();
    } else {
      toast.add({
        title: msg,
        color: "error",
        icon: "ri:close-circle-line",
      });
    }
  } catch {
    toast.add({
      title: "删除失败，请稍后重试",
      color: "error",
      icon: "ri:close-circle-line",
    });
  } finally {
    deleteId.value = "";
  }
};

// 操作成功回调
const handleSuccess = () => {
  handleReset();
};

// 列配置项
const columns: TableColumn<WebsiteList>[] = [
  {
    accessorKey: "name",
    header: "站点名称",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      return h("div", { class: "flex justify-center gap-2" }, [
        h(
          UBadge,
          {
            variant: "soft",
          },
          () => row.getValue("name")
        ),
        h(UIcon, {
          name: "ri:share-box-fill",
          class: "cursor-pointer",
          onClick: () => window.open(row.original.url, "_blank", "noopener,noreferrer"),
        }),
      ]);
    },
  },
  {
    accessorKey: "logo",
    header: "Logo",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) =>
      h(SiteImage, {
        url: row.original.logo,
        size: 32,
        color: row.original.color,
        class: "m-auto",
      }),
  },
  {
    accessorKey: "tags",
    header: "站点标签",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      const tags = row.original?.tags || [];

      return h(
        "div",
        { class: "flex justify-center gap-2 flex-wrap" },
        tags.map((tag) =>
          h(UBadge, {
            color: "neutral",
            variant: "soft",
            label: tag,
          })
        )
      );
    },
  },
  {
    accessorKey: "category_id",
    header: "所属分类",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      const categoryName = row.original.ds_categorys?.name || "--";

      return h(UBadge, {
        variant: "soft",
        color: "info",
        label: categoryName,
      });
    },
  },
  {
    accessorKey: "desc",
    header: "站点描述",
    meta: {
      class: {
        td: "text-center w-20",
        th: "text-center w-20",
      },
    },
  },
  {
    accessorKey: "sort",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "排序",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () =>
          column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return h(
        UBadge,
        {
          color: "info",
          variant: "soft",
        },
        () => row.getValue("sort")
      );
    },
  },
  {
    accessorKey: "pinned",
    header: "置顶",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      const pinned = row.original.pinned;

      return h("div", { class: "flex justify-center" }, [
        h(UCheckbox, {
          disabled: true,
          modelValue: !!pinned,
        }),
      ]);
    },
  },
  {
    accessorKey: "vpn",
    header: "VPN",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      const vpn = row.original.vpn;

      return h("div", { class: "flex justify-center" }, [
        h(UCheckbox, {
          disabled: true,
          modelValue: !!vpn,
        }),
      ]);
    },
  },
  {
    accessorKey: "recommend",
    header: "推荐",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      const recommend = row.original.recommend;

      return h("div", { class: "flex justify-center" }, [
        h(UCheckbox, {
          disabled: true,
          modelValue: !!recommend,
        }),
      ]);
    },
  },
  {
    accessorKey: "commonlyUsed",
    header: "常用",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      const commonlyUsed = row.original.commonlyUsed;

      return h("div", { class: "flex justify-center" }, [
        h(UCheckbox, {
          disabled: true,
          modelValue: !!commonlyUsed,
        }),
      ]);
    },
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) =>
      dayjs(row.original.created_at).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    accessorKey: "updated_at",
    header: "更新时间",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) =>
      row.original.updated_at
        ? dayjs(row.original.updated_at).format("YYYY-MM-DD HH:mm:ss")
        : "--",
  },
  {
    accessorKey: "actions",
    header: "操作",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      return h("div", { class: "flex justify-center gap-2" }, [
        h(UButton, {
          color: "primary",
          variant: "soft",
          icon: "ri:edit-line",
          size: "xs",
          label: "编辑",
          class: "cursor-pointer",
          onClick: () => handleEdit(row.original),
        }),
        h(UButton, {
          color: "error",
          variant: "soft",
          icon: "ri:delete-bin-line",
          size: "xs",
          label: "删除",
          loading: row.original.id === deleteId.value,
          class: "cursor-pointer",
          onClick: () => handleDelete(row.original),
        }),
      ]);
    },
  },
];

// 表格实例
const table = useTemplateRef("table");

// 操作列固定在右侧，不提供手动切换入口
const columnPinning = ref({
  left: [],
  right: ["actions"],
});

// 列隐藏
const columnVisibility = ref({
  desc: false,
  updated_at: false,
});

// 列名称映射
const columnVisibilityMap: Record<string, string> = reactive({
  name: "站点名称",
  logo: "Logo",
  tags: "站点标签",
  category_id: "所属分类",
  desc: "站点描述",
  url: "站点链接",
  pinned: "置顶",
  vpn: "VPN",
  recommend: "推荐",
  commonlyUsed: "常用",
  actions: "操作",
  sort: "排序",
  created_at: "创建时间",
  updated_at: "更新时间",
});
</script>
