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

    &:hover {
        opacity: 0.7;
    }

    &:disabled,
    &.disabled {
        color: var(--text-dim);
        cursor: not-allowed;
        opacity: 1;
    }
}
</style>
