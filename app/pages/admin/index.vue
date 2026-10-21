<template>
  <UCard variant="subtle">
    <UTabs v-model="activeTab" :items="items" class="w-full" color="neutral" :unmount-on-hide="false">
      <template #categorys>
        <Categorys />
      </template>
      <template #websites>
        <Websites />
      </template>
    </UTabs>
  </UCard>
</template>

<script lang="ts" setup>
import type { TabsItem } from "@nuxt/ui";
import Categorys from "./_components/categorys/index.vue";
import Websites from "./_components/websites/index.vue";

const items = ref<TabsItem[]>([
  {
    label: "网站分类",
    icon: "ri:menu-5-line",
    slot: "categorys" as const,
  },
  {
    label: "分类站点",
    icon: "ri:planet-line",
    slot: "websites" as const,
  },
]);

const activeTab = ref<TabsItem["label"]>("网站分类"); // 默认选中“网站分类”

// 从 localStorage 恢复状态
const restoreState = () => {
  const savedState = localStorage.getItem("tabState");
  if (savedState) {
    const state = JSON.parse(savedState);
    activeTab.value = state.activeTab || "网站分类"; // 恢复页签状态，默认为“网站分类”
  } else {
    activeTab.value = "网站分类"; // 缓存为空时默认选中“网站分类”
  }
};

// 保存状态到 localStorage
const saveState = () => {
  const state = {
    activeTab: activeTab.value,
  };
  localStorage.setItem("tabState", JSON.stringify(state));
};

// 页面加载时恢复状态
onMounted(() => {
  restoreState();
});

// 页签变化时保存
watch(activeTab, () => {
  saveState();
});

definePageMeta({
  title: "后台管理",
});
</script>