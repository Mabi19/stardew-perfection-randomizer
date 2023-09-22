<template>
    <li class="goal">
        <ListGoalStatus :goal="goal"></ListGoalStatus>
        <span class="name">{{ goal.name }}</span>
    </li>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal
}>()
</script>

<style scoped lang="scss">
.goal {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 8px;
}
</style>