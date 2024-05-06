<template>
    <div class="row">
        <label for="theme">Theme</label>
        <select v-model="settings.selectedTheme" id="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
        </select>
    </div>
    <div class="row">
        <label for="particles">Particle effects</label>
        <select v-model="settings.selectedParticles" id="particles">
            <option value="disabled">Off</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </select>
        <em v-if="settings.systemPrefersReducedMotion">(disabled by system setting)</em>
    </div>
</template>

<script setup lang="ts">
const settings = useSettingsStore();
</script>
