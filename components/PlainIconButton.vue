<template>
    <button class="plain-button material-icons">{{ icon }}</button>
</template>

<script setup lang="ts">
const props = defineProps<{
    icon: string;
}>();
</script>

<style scoped lang="scss">
@use "~/assets/base";

.plain-button {
    padding: 0;
    margin: 0;
    border: none;
    background: unset;
    cursor: pointer;
    font-size: 1.25rem;

    &:hover:not(:disabled) {
        opacity: 0.7;
    }

    &:disabled {
        color: var(--text-light);
        cursor: not-allowed;
    }
}
</style>
