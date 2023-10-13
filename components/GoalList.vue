<template>
    <table class="goal-list">
        <thead>
            <tr>
                <th>Comp.</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <ListGoal v-for="goal in store.goals" :goal="goal"></ListGoal>
        </tbody>
    </table>
</template>

<script setup lang="ts">
const store = useAppStore();
</script>

<style scoped lang="scss">
.goal-list {
    // display: flex;
    // flex-flow: column nowrap;
    gap: 2px;
}
</style>