<template>
    <h2>XP Prediction</h2>
    <pre><code>{{ JSON.stringify(randomizer.predictedSkillXP) }}</code></pre>
</template>

<script setup lang="ts">
const randomizer = useRandomizerStore();
</script>
