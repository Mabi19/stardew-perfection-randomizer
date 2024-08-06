<template>
    <div class="settings">
        <h1>Settings</h1>

        <StoragePersistenceWarning />

        <TabSwitcher
            v-model="selectedTab"
            :options="['Appearance', 'Profile Management', 'Stream Overlay', 'About']"
        />

        <div class="settings-content">
            <KeepAlive>
                <SettingsAppearance v-if="selectedTab == 'Appearance'" />
                <SettingsProfileManagement v-else-if="selectedTab == 'Profile Management'" />
                <SettingsStreamOverlay v-else-if="selectedTab == 'Stream Overlay'" />
                <SettingsAbout v-else-if="selectedTab == 'About'" />
            </KeepAlive>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: "Settings",
});

const selectedTab = ref("Appearance");
</script>

<style scoped lang="scss">
.settings {
    padding: 1rem;

    h1 {
        margin-top: 0;
    }
}

.settings-content {
    margin: 0.75rem 0;
}
</style>
