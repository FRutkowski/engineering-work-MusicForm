<template>
  <div>
    <new-project v-if="currentView === 'NewProject'"></new-project>
    <my-projects v-if="currentView === 'MyProjects'"></my-projects>
    <game-mode v-if="currentView === 'GameMode'"></game-mode>
    <current-project v-if="currentView === 'CurrentProject'"></current-project>
  </div>

</template>
<script setup>

let currentView = ref("0")


</script>