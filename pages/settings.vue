<template>
    <div class="settings">
        <h1>Settings</h1>

        <Panel type="warning" v-if="!persistence.isPersistent.value">
            <strong>Storage is not marked as persistent</strong>
            <div>
                This web app's storage has not been marked as persistent, which means that your data
                may be deleted by the browser, e.g. when not in use for a long time or disk space is
                running out. Click the button below to request persistence from the browser.
            </div>
            <em>Note that this does not protect your data from being deleted manually.</em>
            <AppButton
                @click="requestPersistence"
                icon="priority_high"
                :disabled="persistenceRejected"
                >Request storage persistence</AppButton
            >
            <div v-if="persistenceRejected">Request was rejected. Try again later.</div>
        </Panel>

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

const persistence = useStoragePersistence();
const persistenceRejected = ref(false);
async function requestPersistence() {
    if (!(await persistence.request())) {
        persistenceRejected.value = true;
    }
}

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
