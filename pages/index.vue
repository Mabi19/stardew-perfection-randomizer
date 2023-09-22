<template>
    <div>
        <GoalList :goals="goals"></GoalList>
    </div>
</template>

<script setup lang="ts">
import { loadCompletedGoals } from '~/utils/goals';

const template = await loadTemplate("hardcore");
if (!template) {
    throw new Error("bad template");
}
const { tags, goals } = loadCompletedGoals(template);
</script>