<template>
    <div class="panel" :class="[type]"><slot /></div>
</template>

<script setup lang="ts">
const props = defineProps<{
    type: "warning";
}>();
</script>

<style scoped lang="scss">
@use "sass:color";

@mixin panel-color($base) {
    border: 2px solid $base;
    background-color: color.change($base, $alpha: 0.25);
}

.panel {
    padding: 0.5rem;
    border-radius: 0.5rem;
}

.warning {
    @include panel-color(#ffda0b);
}
</style>
