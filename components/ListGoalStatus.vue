<template>
    <span class="status">
        <input v-if="goal.multiplicity == 1" type="checkbox" :checked="Boolean(goal.complete)">
        <span class="status-badge" v-else>
            <input class="completion-input" type="number" min="0" :max="goal.multiplicity" :value="goal.complete">/{{ goal.multiplicity }}
        </span>
    </span>
</template>

<script setup lang="ts">
const _props = defineProps<{
    goal: Goal
}>()
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
    border-color: red;
}
</style>