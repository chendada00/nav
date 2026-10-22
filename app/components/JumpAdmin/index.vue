<template>
  <client-only>
    <template v-if="user">
      <UTooltip text="进入管理后台">
        <a href="/admin" target="_blank" rel="noopener noreferrer">
          <UButton
            icon="ri:apps-fill"
            size="lg"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            :ui="{ leadingIcon: '!size-5' }"
          />
        </a>
      </UTooltip>
    </template>
  </client-only>
</template>
<script setup lang="ts">
const user = useSupabaseUser();
</script>
