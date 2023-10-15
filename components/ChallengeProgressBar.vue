<template>
    <div
        class="progress-bar"
        :class="{ full: isFull }"
        :style="progressFill"
    ></div>
</template>

<script setup lang="ts">
const props = defineProps<{
    fill: number;
}>();

const progressFill = computed(() => ({
    "--fill": `${100 * props.fill}%`,
}));

const isFull = computed(() => props.fill == 1);
</script>

<style scoped lang="scss">
@use "~/assets/base";

.progress-bar {
    width: 100%;
    transform: translateX(calc(-100% + var(--fill)));
    transition:
        transform 1s ease-out,
        border-top-right-radius 1s ease-out,
        background 1s ease-out;

    height: 0.5rem;
    border-top-right-radius: 0.5rem;

    background: base.$accent;

    // this is needed for the full bar gradient to be contained within
    // (it is absolute-positioned, so we need a new stacking context)
    contain: layout;
}

.progress-bar::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0.5rem;

    opacity: 0;
    transition: opacity 1s ease-out;

    background: linear-gradient(
        to right,
        hsl(0deg, 100%, 70%),
        hsl(10deg, 100%, 70%),
        hsl(20deg, 100%, 70%),
        hsl(30deg, 100%, 70%),
        hsl(40deg, 100%, 70%),
        hsl(50deg, 100%, 70%),
        hsl(60deg, 100%, 70%),
        hsl(70deg, 100%, 70%),
        hsl(80deg, 100%, 70%),
        hsl(90deg, 100%, 70%),
        hsl(100deg, 100%, 70%),
        hsl(110deg, 100%, 70%),
        hsl(120deg, 100%, 70%),
        hsl(130deg, 100%, 70%),
        hsl(140deg, 100%, 70%),
        hsl(150deg, 100%, 70%),
        hsl(160deg, 100%, 70%),
        hsl(170deg, 100%, 70%),
        hsl(180deg, 100%, 70%),
        hsl(190deg, 100%, 70%),
        hsl(200deg, 100%, 70%),
        hsl(210deg, 100%, 70%),
        hsl(220deg, 100%, 70%),
        hsl(230deg, 100%, 70%),
        hsl(240deg, 100%, 70%),
        hsl(250deg, 100%, 70%),
        hsl(260deg, 100%, 70%),
        hsl(270deg, 100%, 70%),
        hsl(280deg, 100%, 70%),
        hsl(290deg, 100%, 70%),
        hsl(300deg, 100%, 70%),
        hsl(310deg, 100%, 70%),
        hsl(320deg, 100%, 70%),
        hsl(330deg, 100%, 70%),
        hsl(340deg, 100%, 70%),
        hsl(350deg, 100%, 70%),
        hsl(360deg, 100%, 70%)
    );
}

.progress-bar.full {
    transform: none;
    border-top-right-radius: 0;
}

.progress-bar.full::after {
    opacity: 1;
}
</style>
