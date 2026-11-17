
<template>
  <div class="flex flex-col gap-4">
    <!-- 顶部搜索和操作 -->
    <div class="flex flex-wrap justify-between items-center gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="name"
          placeholder="输入分类名称搜索"
          class="w-60"
          @keyup.enter="handleSearch"
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
      :category="currentCategory"
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
              确认删除分类？
            </h3>

            <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              此操作无法撤销，请确认是否删除该分类。
            </p>
          </div>

          <!-- 分类信息 -->
          <div
            v-if="deleteTarget"
            class="mt-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-700"
            >
              <UIcon
                :name="deleteTarget.icon || 'ri:folder-3-line'"
                class="h-5 w-5 text-gray-500 dark:text-gray-300"
              />
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ deleteTarget.name }}
              </p>

              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ deleteTarget.ds_websites?.length || 0 }} 个关联网站
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
              删除后，该分类将从分类列表中移除。请留意该分类下的网站关联情况。
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
  CategoryList,
  Response,
  CategoryEdit,
} from "~/lib/type";
import { RESPONSE_STATUS_CODE } from "~/lib/enum";
import type { TableColumn } from "@nuxt/ui";
import EditModal from "./components/EditModal.vue";
import { pick } from "~/lib/utils";

const UBadge = resolveComponent("UBadge");
const UIcon = resolveComponent("UIcon");
const UButton = resolveComponent("UButton");

const dayjs = useDayjs();
const toast = useToast();

// 请求参数
const current = ref(1);
const pageSize = ref(10);
const name = ref("");

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
const deleteTarget = ref<CategoryList | null>(null);

// 编辑模态框状态
const showEditModal = ref(false);
const currentCategory = ref<CategoryEdit | null>(null);

// 从 localStorage 恢复状态
const restoreState = () => {
  const savedState = localStorage.getItem("websiteFilterStateCategorys");

  if (savedState) {
    try {
      const state = JSON.parse(savedState);

      name.value = state.name || "";
      current.value = Math.max(1, Number(state.current) || 1);

      const savedPageSize = Number(state.pageSize);

      pageSize.value = [10, 20, 50, 100].includes(savedPageSize)
        ? savedPageSize
        : 10;
    } catch {
      localStorage.removeItem("websiteFilterStateCategorys");
    }
  }
};

// 保存状态到 localStorage
const saveState = () => {
  const state = {
    name: name.value,
    current: current.value,
    pageSize: pageSize.value,
  };

  localStorage.setItem(
    "websiteFilterStateCategorys",
    JSON.stringify(state)
  );
};

// 页面加载时恢复状态
onMounted(async () => {
  restoreState();
  await refresh();
});

// 状态变化时保存
watch([name, current, pageSize], () => {
  saveState();
});

// 请求分类列表
const {
  data,
  refresh,
  status,
} = await useFetch<Response<PageResponse<CategoryList>>>(
  "/api/categorys",
  {
    query: {
      current,
      pageSize,
      name,
    },
    watch: false,
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

// 重置回调
const handleReset = async () => {
  current.value = 1;
  name.value = "";
  currentCategory.value = null;

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
  currentCategory.value = null;
  showEditModal.value = true;
};

// 编辑回调
const handleEdit = (category: CategoryList) => {
  currentCategory.value = pick(category, [
    "id",
    "name",
    "desc",
    "icon",
    "sort",
  ]);

  showEditModal.value = true;
};

// 打开删除确认框
const handleDelete = (category: CategoryList) => {
  if (deleteId.value) return;

  deleteTarget.value = category;
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
  const category = deleteTarget.value;

  if (!category || deleteId.value) return;

  deleteId.value = category.id;

  try {
    const { code, msg } = await $fetch("/api/categorys", {
      method: "DELETE",
      body: {
        id: category.id,
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
const columns: TableColumn<CategoryList>[] = [
  {
    accessorKey: "name",
    header: "分类名称",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      const count = row.original.ds_websites?.length || 0;

      return h(
        "div",
        {
          class: "flex items-center justify-center gap-2 flex-wrap",
        },
        [
          h(
            UBadge,
            {
              variant: "soft",
            },
            () => row.getValue("name")
          ),
          h(
            "span",
            {
              class:
                "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium leading-5 text-gray-600 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap",
            },
            [
              h(
                "span",
                {
                  class: "font-semibold tabular-nums",
                },
                String(count)
              ),
              h(
                "span",
                {
                  class: "opacity-80",
                },
                "个站点"
              ),
            ]
          ),
        ]
      );
    },
  },
  {
    accessorKey: "desc",
    header: "分类描述",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
  },
  {
    accessorKey: "icon",
    header: "分类图标",
    meta: {
      class: {
        td: "text-center",
        th: "text-center",
      },
    },
    cell: ({ row }) => {
      return row.original.icon
        ? h(UIcon, {
            name: row.original.icon,
            size: "30",
          })
        : "--";
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
        td: "text-center !bg-transparent",
        th: "text-center !bg-transparent",
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
  updated_at: false,
});

// 列名称映射
const columnVisibilityMap: Record<string, string> = reactive({
  name: "分类名称",
  desc: "分类描述",
  icon: "分类图标",
  actions: "操作",
  sort: "排序",
  created_at: "创建时间",
  updated_at: "更新时间",
});
</script>
