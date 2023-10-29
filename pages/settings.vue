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
    </div>
</template>

<script setup lang="ts">
const settings = useSettingsStore();
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
