<template>
    <tr class="goal">
        <ListGoalStatus :goal="goal"></ListGoalStatus>
        <td class="name">
            <label :for="`goal:${goal.id}`"><Goal :goal="goal" /></label>
        </td>
        <td class="info">
            <button class="info-button material-icons" @click="openDialog">more_horiz</button>
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

<style scoped lang="scss">
.info-button {
    padding: 0;
    margin: 0;
    border: none;
    background: unset;
    cursor: pointer;
    font-size: 1.25rem;

    &:hover {
        opacity: 0.7;
    }
}
</style>
