<template>
    <button class="button" :class="type">
        <span v-if="icon" class="material-icons">{{ icon }}</span>
        <span><slot /></span>
    </button>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        type?: "default" | "destructive";
        icon?: string;
    }>(),
    {
        type: "default",
    },
);
</script>

<style scoped lang="scss">
@use "~/assets/base";
@use "sass:color";

.button {
    // override all the defaults
    border: none;
    font: inherit;
    cursor: pointer;

    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
    &:hover {
        opacity: 0.9;
    }

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.4rem;
}

.button:disabled {
    cursor: not-allowed;
    opacity: 0.75;
}

.button.default {
    background-color: base.$accent;
    color: whitesmoke;
}

.button.destructive {
    background-color: rgb(230, 86, 60);
    color: whitesmoke;
}
</style>
