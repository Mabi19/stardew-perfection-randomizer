<template>
    <NuxtPwaManifest />
    <DialogProvider>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </DialogProvider>
</template>

<script setup lang="ts">
const settings = useSettingsStore();

useHead({
    titleTemplate: (titleChunk) => {
        return titleChunk
            ? `${titleChunk} - Stardew Perfection Randomizer`
            : "Stardew Perfection Randomizer";
    },
    bodyAttrs: {
        class: {
            "dark-theme": () => settings.theme == "dark",
        },
    },
});
</script>
