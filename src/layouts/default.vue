<script setup>
const route = useRoute()
const currentView = computed(() => {
  return route.name
})
</script>

<template>
  <main>
      <div id="nav">
        <router-link to="/new-project" custom #="{ navigate, isActive }">
          <navigation-button @click="navigate()" buttonName="New Project" :is-active="isActive" />
        </router-link>

        <router-link to="/my-projects" custom #="{ navigate, isActive }">
          <navigation-button @click="navigate()" buttonName="My Projects" :is-active="isActive" />
        </router-link>

        <router-link to="/game-mode" custom #="{ navigate, isActive }">
          <navigation-button @click="navigate()" buttonName="Game Mode" :is-active="isActive" />
        </router-link>

        <router-link to="/current-project" custom #="{ navigate, isActive }">
          <navigation-button @click="navigate()" buttonName="Current Project" :is-active="isActive" />
        </router-link>
      </div>

      <router-view />
  </main>
</template>
