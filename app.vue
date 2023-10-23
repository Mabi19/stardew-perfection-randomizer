<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
    titleTemplate: (titleChunk) => {
        return titleChunk
            ? `${titleChunk} - Stardew Perfection Randomizer`
            : "Stardew Perfection Randomizer";
    },
});
</script>
