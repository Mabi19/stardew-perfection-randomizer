<template>
    <ul class="goal-list">
        <ListGoal v-for="goal in goals" :goal="goal" :key="goal.id" @update="console.log"></ListGoal>
    </ul>
</template>

<script setup lang="ts">
import { Goal } from '../utils/goals';

const props = defineProps<{
    goals: Goal[]
}>();
</script>

<style scoped lang="scss">
.goal-list {
    display: flex;
    flex-flow: column nowrap;
    gap: 2px;
}
</style>