<template>
  <client-only>
    <UTooltip text="注销用户">
      <UButton
        v-if="user"
        icon="ri:logout-box-r-line"
        size="lg"
        color="neutral"
        variant="ghost"
        class="cursor-pointer"
        @click="logout"
        :loading="loading"
        :ui="{
          leadingIcon: '!size-5',
        }"
      />
    </UTooltip>
  </client-only>
</template>
<script setup lang="ts">
const client = useSupabaseClient();
const user = useSupabaseUser();

const loading = ref(false);

// 注销用户
const logout = async () => {
  loading.value = true;
  await client.auth.signOut().then(() => {
    loading.value = false;
    navigateTo("/");
  });
};
</script>
