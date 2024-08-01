<template>
    <div class="log-entry">{{ entry.type }} {{ entry.goal.id }}</div>
</template>

<script setup lang="ts">
defineProps<{
    entry: LogEntry;
}>();
</script>

<style scoped lang="scss">
.log-entry {
    height: 30px;
}
</style>
