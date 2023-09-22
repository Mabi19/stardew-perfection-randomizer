<template>
    <div>
        <GoalList :goals="goals"></GoalList>
    </div>
</template>

<script setup lang="ts">
const state = useAppState();

const goals = state.value.goals;

watch([state.value.goals], () => {
    console.log("state changed");
})
</script>