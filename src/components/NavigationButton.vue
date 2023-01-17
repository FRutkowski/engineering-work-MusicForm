<script setup>

const props = defineProps({
  buttonName: String,
  isActive: Boolean
})

const emit = defineEmits(['onViewChange'])
</script>

<template>
  <button :class="isActive ? 'activeButton' : 'inactiveButton'">{{ buttonName }}</button>
</template>
