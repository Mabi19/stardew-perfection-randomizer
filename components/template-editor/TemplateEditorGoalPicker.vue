<!-- TODO: disqualify current goal -->
<!-- TODO: disqualify already present goals (only on this level though) -->
<template>
    <input
        type="text"
        list="goal-picker-datalist"
        v-model="selectedGoal"
        v-invalid="selectedGoal == '' || selectedGoal in eligibleGoals ? '' : 'Invalid goal ID'"
        required
    />
    <datalist id="goal-picker-datalist">
        <option v-for="(label, id) in eligibleGoals" :value="id">{{ label }}</option>
    </datalist>
</template>

<script setup lang="ts">
import { vInvalid } from "#imports";

const props = defineProps<{
    template: Template;
}>();

const selectedGoal = defineModel<string>({ required: true });

const eligibleGoals = computed(() => {
    const result: Record<string, string> = {};

    for (const goal of props.template.goals) {
        result[goal.id] = goal.name;
    }

    for (const tagID of Object.keys(props.template.tags)) {
        const annotatedID = `#${tagID}`;
        result[annotatedID] = annotatedID;
    }

    return result;
});
</script>
