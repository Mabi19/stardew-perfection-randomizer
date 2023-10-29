<template>
    <div class="settings">
        <h1>Settings</h1>

        <h2>Appearance</h2>
        <div class="row">
            <label for="theme">Theme</label>
            <select v-model="settings.selectedTheme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
            </select>
        </div>

        <h2>Profile Management</h2>
        <div>coming soon™</div>

        <h2>Debug Info</h2>
        <h3>XP Prediction</h3>
        <pre><code>{{ JSON.stringify(randomizer.predictedSkillXP) }}</code></pre>
        <h3>Version</h3>
        <div>{{ config.version }} ({{ config.buildID }})</div>
    </div>
</template>

<script setup lang="ts">
const randomizer = useRandomizerStore();
const settings = useSettingsStore();

const config = useAppConfig();
</script>

<style scoped lang="scss">
.settings {
    padding: 1rem;

    h1 {
        margin-top: 0;
    }
}

.row {
    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
}
</style>
