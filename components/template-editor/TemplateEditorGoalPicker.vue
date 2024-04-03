<template>
    <AppDialog title="Select goal" :open="active" @close="cancel">
        <form @submit.prevent="finish">
            <div class="row">
                <label for="new-prerequisite-goal">Goal:</label>
                <input
                    type="text"
                    list="goal-picker-datalist"
                    v-model="selectedGoalID"
                    v-invalid="
                        selectedGoalID == '' || selectedGoalID in eligibleGoals
                            ? ''
                            : 'Invalid goal ID'
                    "
                    required
                />
                <datalist id="goal-picker-datalist">
                    <option v-for="(label, id) in eligibleGoals" :value="id">{{ label }}</option>
                </datalist>
            </div>
            <div class="row" v-if="useMultiplicity">
                <label for="new-prerequisite-multiplicity">Multiplicity:</label>
                <input
                    type="number"
                    id="new-prerequisite-multiplicity"
                    v-model.number="multiplicity"
                    :disabled="selectedIsTag"
                    :placeholder="selectedIsTag ? undefined : '1'"
                    min="1"
                    :max="maxMultiplicity"
                />
            </div>

            <AppButton icon="check" class="dialog-button-margin">Confirm</AppButton>
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
import { vInvalid, type SinglePrerequisite } from "#imports";
import { template } from "lodash-es";

const props = defineProps<{
    active: boolean;
    template: Template;
    disqualified: Set<string>;
    useMultiplicity: boolean;
}>();

const emit = defineEmits<{
    finish: [result: SinglePrerequisite];
    cancel: [];
}>();

const selectedGoalID = ref("");
const multiplicity = ref<string | number>("");

const selectedIsTag = computed(() => {
    return selectedGoalID.value.startsWith("#");
});

watchEffect(() => {
    if (selectedIsTag.value) {
        multiplicity.value = "";
    }
});

watchEffect(() => {
    if (!props.active) {
        selectedGoalID.value = "";
    }
});

const eligibleGoals = computed(() => {
    const result: Record<string, string> = {};

    for (const goal of props.template.goals) {
        if (props.disqualified.has(goal.id)) {
            continue;
        }

        result[goal.id] = goal.name;
    }

    for (const tagID of Object.keys(props.template.tags)) {
        const annotatedID = `#${tagID}`;
        if (props.disqualified.has(annotatedID)) {
            continue;
        }

        result[annotatedID] = annotatedID;
    }

    return result;
});

const maxMultiplicity = computed(() => {
    // This is a linear search, which is not the best.
    // But it's only going to be done infrequently (only when the goal is valid)
    if (!(selectedGoalID.value in eligibleGoals.value)) {
        return undefined;
    }

    if (selectedGoalID.value.startsWith("#")) {
        return undefined;
    }

    return props.template.goals.find((testGoal) => testGoal.id == selectedGoalID.value)
        ?.multiplicity;
});

function finish() {
    const result: SinglePrerequisite = { goal: selectedGoalID.value };
    if (
        !selectedIsTag.value &&
        typeof multiplicity.value == "number" &&
        multiplicity.value > 0 &&
        props.useMultiplicity
    ) {
        result.multiplicity = multiplicity.value;
    }
    emit("finish", result);
}

function cancel() {
    emit("cancel");
}
</script>
