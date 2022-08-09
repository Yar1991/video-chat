<script setup>
import { onMounted } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useStore } from "./store";

const chatState = useStore();

onMounted(() => {
  const app = document.getElementById("app");
  useResizeObserver(app, (entries) => {
    const entry = entries[0];
    if (entry.contentRect.width < 1024) {
      chatState.isMobile = true;
    } else {
      chatState.isMobile = false;
    }
  })
});

</script>

<template>
  <RouterView></RouterView>
</template>

<style lang="scss" scoped>
</style>
