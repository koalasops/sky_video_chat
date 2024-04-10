<template>
  <div
    class="w-full shadow-lg h-16 flex items-center justify-between px-12 bg-gray-50 dark:bg-gray-900 z-50"
  >
    <div class="w-full flex gap-4 block dark:text-white">
      <router-link :to="{ name: 'home' }"> Home </router-link>
      <router-link :to="{ name: 'room' }"> Room </router-link>
    </div>
    <div class="login-group flex items-center gap-4 dark:text-white">
      <router-link :to="{ name: 'login' }">
        <i class="pi pi-sign-in" />
      </router-link>
      <router-link :to="{ name: 'register' }">
        <i class="pi pi-user" />
      </router-link>
    </div>
  </div>
</template>
