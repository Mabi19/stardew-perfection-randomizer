<template>
    <span class="status">
        <input v-if="goal.multiplicity == 1" type="checkbox" :checked="Boolean(goal.complete)" @change="handleCheckbox">
        <span class="status-badge" v-else>
            <input
                class="completion-input"
                type="number"
                min="0"
                :max="goal.multiplicity"
                :value="goal.complete"
                @input="handleInput"
            >/{{ goal.multiplicity }}
        </span>
    </span>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal
}>()

const emit = defineEmits<{
    (event: "update", goalID: string, completion: number): void
}>();

function handleCheckbox(event: Event) {
    sendEvent(Number((event.target as HTMLInputElement).checked))
}

function handleInput(event: Event) {
    sendEvent(Number((event.target as HTMLInputElement).value));
}

function sendEvent(state: number) {
    const numericValue = typeof state == "number" ? state : Number(state);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > props.goal.multiplicity) {
        return;
    }

    emit('update', props.goal.id, numericValue);
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

.status {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
}

.status-badge {
    background-color: base.$accent;
    color: white;
    padding: 2px 6px;
    border-radius: 16px;
    font-weight: bold;
    font-size: 0.8em;
}

.completion-input {
    appearance: textfield;
    border-radius: 4px;
    border: none;
    width: 2ch;
    box-sizing: content-box;
    text-align: right;
    font: inherit;

    background-color: base.$accent-light;
    color: white;
}

.completion-input:invalid {
    outline: 2px solid red;
}
</style>