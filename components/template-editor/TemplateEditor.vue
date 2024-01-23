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

<style>
.overlay-hack-active .layout > .content {
    display: none;
}
</style>
