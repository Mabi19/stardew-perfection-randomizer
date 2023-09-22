<template>
    <li class="goal">
        <ListGoalStatus :goal="goal" @update="passEvent"></ListGoalStatus>
        <span class="name">{{ goal.name }}</span>
    </li>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal
}>()

const emit = defineEmits<{
    (event: "update", goalID: string, completion: number): void
}>();

function passEvent(goalID: string, completion: number) {
    emit("update", goalID, completion);
}
</script>

<style scoped lang="scss">
.goal {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 8px;
}
</style>