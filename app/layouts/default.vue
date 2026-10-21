<template>
  <div>
    <Header />

    <main style="min-height: calc(100vh - 9rem)" class="!overflow-y-hidden p-4">
      <slot />
    </main>

    <Footer />

    <div
        class="fixed bottom-10 right-10 z-50 flex flex-col items-center space-y-3"
    >
      <ClientOnly>
        <BackTop />
      </ClientOnly>
      <ClientOnly>
        <UButton
            :icon="isAllCollapsed ? 'i-mingcute-unfold-vertical-fill' : 'mingcute:fold-vertical-fill'"
            size="xl"
            color="primary"
            variant="solid"
            @click="handleGlobalToggle"
            square
            class="z-50 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer rounded-full"
            :title="isAllCollapsed ? '全部展开' : '全部折叠'"
        />
      </ClientOnly>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

// 1. 追踪当前全局状态 (默认在 SSR 期间设置为 false，等待客户端初始化)
const globalStateRef = ref(false);

// 2. 按钮显示的文本和状态
const isAllCollapsed = computed(() => globalStateRef.value);

// 3. 全局按钮点击处理函数
const handleGlobalToggle = () => {
  // 确保只在客户端执行
  if (process.client) {
    const newState = !globalStateRef.value;

    // 关键：修改 localStorage
    localStorage.setItem('globalCollapseState', newState ? 'true' : 'false');

    // 立即更新本地状态
    globalStateRef.value = newState;

    // 手动触发 'storage' 事件，让 pages/index.vue 监听
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'globalCollapseState',
      newValue: newState ? 'true' : 'false',
      url: window.location.href,
      storageArea: localStorage
    }));
  }
};

// 4. 挂载时（客户端）监听 localStorage
onMounted(() => {
  // 初始同步状态
  const savedState = localStorage.getItem('globalCollapseState');
  if (savedState !== null) {
    globalStateRef.value = savedState === 'true';
  }

  // 监听 storage 事件
  const updateStateFromStorage = (event: StorageEvent) => {
    if (event.key === 'globalCollapseState' && event.newValue !== null) {
      globalStateRef.value = event.newValue === 'true';
    }
  };

  window.addEventListener('storage', updateStateFromStorage);
  onUnmounted(() => {
    window.removeEventListener('storage', updateStateFromStorage);
  });
});
</script>