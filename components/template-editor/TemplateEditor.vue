<template>
    <Teleport to="body">
        <div class="overlay-hack">XD</div>
    </Teleport>
    <Body class="overlay-hack-active" v-if="active" />
</template>

<script setup lang="ts">
const props = defineProps<{
    active: boolean;
}>();
</script>

<style scoped lang="scss">
.overlay-hack {
    padding: 1rem;
}

// Hide everything while the template editor's active.
:global(.overlay-hack-active .layout) {
    display: none;
}
</style>
