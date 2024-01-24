<template>
    <tr class="goal">
        <ListGoalStatus :goal="goal"></ListGoalStatus>
        <td class="name">
            <label :for="`goal:${goal.id}`"><Goal :goal="goal" /></label>
        </td>
        <td class="info">
            <button class="plain-button material-icons" @click="openDialog">more_horiz</button>
        </td>
    </tr>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal;
}>();

const emit = defineEmits<{
    infoClick: [goal: Goal];
}>();

// we want the list items to be as light as possible, so defer opening the dialog box to the parent
function openDialog() {
    emit("infoClick", props.goal);
}
</script>
