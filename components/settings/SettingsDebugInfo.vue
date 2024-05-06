<template>
    <details>
        <summary>Debug Info</summary>
        <h3>XP Prediction</h3>
        <pre><code>{{ JSON.stringify(randomizer.predictedSkillXP) }}</code></pre>
    </details>
</template>

<script setup lang="ts">
const randomizer = useRandomizerStore();
</script>
