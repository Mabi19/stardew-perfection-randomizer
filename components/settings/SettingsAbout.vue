<template>
    <p>
        This web app is based on the spreadsheet version of the randomizer made by
        <NuxtLink to="https://www.youtube.com/@ArgonMatrix">ArgonMatrix</NuxtLink>.
    </p>
    <p>
        You can find the
        <NuxtLink to="https://github.com/Mabi19/stardew-perfection-randomizer"
            >source code for this app on GitHub</NuxtLink
        >.
    </p>
    <h3>Version</h3>
    <p>{{ config.version }} ({{ config.buildID }})</p>

    <KofiButton color="#29abe0" />
</template>

<script setup lang="ts">
const config = useAppConfig();
</script>
