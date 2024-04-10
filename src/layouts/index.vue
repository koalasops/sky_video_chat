<script setup>
import { onMounted } from "vue";
import Navigation from "@/layouts/navigation";

onMounted(async () => {
  const {
    data: { user },
  } = await window.supabase.auth.getUser();
});
</script>
<template>
  <div class="w-full h-screen overflow-x-hidden">
    <div>
      <Navigation />
      <div
        class="main h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
