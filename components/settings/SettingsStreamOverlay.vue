<template>
    <h2>Stream Overlay</h2>
    <p>
        This app supports rendering a stream overlay in an auxiliary window, based on ArgonMatrix's
        templates. It includes cropping guides (red border) and a green background for chromakeying.
    </p>
    <AppButton icon="layers" @click="openOverlay">Open stream overlay</AppButton>
</template>

<script setup lang="ts">
function openOverlay() {
    window.open(
        new URL("/stardew-perfection-randomizer/stream-overlay/", document.location.origin),
        undefined,
        "popup=yes,width=506,height=102",
    );
}
</script>
