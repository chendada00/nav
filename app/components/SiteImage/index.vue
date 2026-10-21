<template>
  <NuxtImg
      v-if="url && isValidImageUrl(url)"
      :src="url"
      alt="logo"
      :width="size"
      :height="size"
  />

  <UIcon
      v-else-if="url"
      :name="url"
      :size="String(size)"
      :style="{ color }"
  />

</template>

<script setup lang="ts">
type Props = {
  url?: string | null; // 修改类型约束，真实反映运行时可能传入 null 的情况
  size?: number;
  color?: string;
};

withDefaults(defineProps<Props>(), {
  url: '',
  size: 40,
  color: "",
});

// 安全校验图片地址
const isValidImageUrl = (urlStr: string) => {
  if (!urlStr) return false;
  // 提示：现有的正则对于相对路径（如 /images/logo.png）或带 Query 参数的 URL（如 img.png?v=1）会返回 false
  const urlPattern = /^(https?:\/\/)[\da-z.-]+\.([a-z.]{2,6})([/\w .-]*\.(jpg|jpeg|png|gif|svg|ico|webp))/i;
  return urlPattern.test(urlStr);
};
</script>