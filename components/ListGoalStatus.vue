<template>
    <td class="status">
        <!-- Do not allow editing the current goal -->
        <template v-if="store.currentGoalID != goal.id">
            <input
                v-if="goal.multiplicity == 1"
                type="checkbox"
                :checked="Boolean(store.completion[goal.id])"
                :id="`goal:${goal.id}`"
                @change="handleCheckbox"
            />
            <span class="badge" v-else>
                <input
                    class="completion-input"
                    type="number"
                    min="0"
                    :max="goal.multiplicity"
                    :value="store.completion[goal.id]"
                    :id="`goal:${goal.id}`"
                    @input="handleInput"
                /><span>/{{ goal.multiplicity }}</span>
            </span>
        </template>
        <span
            class="badge"
            title="Cancel or finish this goal to edit its completion."
            v-else
        >
            current
        </span>
    </td>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal;
}>();

// For performance, the completion is not injected into the goals data, but stored separately
// so, we need to get it manually
const store = useAppStore();

function handleCheckbox(event: Event) {
    update(Number((event.target as HTMLInputElement).checked));
}

function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value == "") {
        return;
    }
    update(Number(value));
}

function update(state: number) {
    const numericValue = typeof state == "number" ? state : Number(state);
    if (
        isNaN(numericValue) ||
        numericValue < 0 ||
        numericValue > props.goal.multiplicity
    ) {
        return;
    }

    store.completion[props.goal.id] = state;
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

.status {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
}

.completion-input {
    border-radius: 4px;
    border: none;
    width: 2ch;
    box-sizing: content-box;
    text-align: right;
    font: inherit;

    background-color: base.$accent-light;
    color: white;

    appearance: textfield;
    &::-webkit-inner-spin-button {
        display: none;
    }
    &::-webkit-outer-spin-button {
        display: none;
    }
}

.completion-input:invalid {
    outline: 2px solid red;
}
</style>
