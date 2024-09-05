<template>
    <button class="button" :class="{ [type]: true, small }">
        <span v-if="icon" class="material-icons">{{ icon }}</span>
        <span><slot /></span>
    </button>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        type?: "default" | "positive" | "destructive" | "secondary";
        icon?: string;
        small?: boolean;
    }>(),
    {
        type: "default",
        small: false,
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

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.4rem;

    &:hover {
        opacity: 0.9;
    }

    &.small {
        /* the icon is a square with whitespace on the sides, so cut some of it off  */
        padding: 0.25rem 0.5rem 0.25rem 0.25rem;
        gap: 0.25rem;
    }
}

.button:disabled {
    cursor: not-allowed;
    opacity: 0.75;
}

.button.default {
    background-color: base.$accent;
    color: whitesmoke;
}

.button.positive {
    background-color: base.$secondary-green;
    color: whitesmoke;
}

.button.destructive {
    background-color: base.$secondary-red;
    color: whitesmoke;
}

.button.secondary {
    background-color: var(--background-lighter);
    color: var(--text);
}

.dark-theme {
    .button:hover:not(:disabled) {
        opacity: 1;
        filter: brightness(1.15);
    }

    .button.destructive {
        background-color: rgb(209, 83, 61);
    }
}
</style>
