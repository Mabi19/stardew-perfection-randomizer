<template>
    <tr class="goal">
        <ListGoalStatus :goal="goal"></ListGoalStatus>
        <td class="name">
            <label :for="`goal:${goal.id}`">{{ goal.name }}</label>
        </td>
    </tr>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal
}>();
</script>
