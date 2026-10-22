<script setup lang="ts">
import type { Social } from "~/lib/type";

defineProps<Social>();
</script>

<template>
  <UTooltip :text="tip">
    <UButton
      :icon="icon"
      size="lg"
      color="neutral"
      variant="ghost"
      class="cursor-pointer"
      :to="url"
      target="_blank"
      :ui="{
        leadingIcon: '!size-5',
      }"
    />
  </UTooltip>
</template>
