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

        <div class="row">
            <AppButton
                icon="add"
                @click="showProfileCreateDialog"
                :disabled="profiles.allProfiles.length >= 5"
            >
                Create new profile
            </AppButton>
            <em v-if="profiles.allProfiles.length >= 5">You have reached the profile limit!</em>
        </div>

        <h3>Current Profile</h3>
        <div class="profile">
            <ProfileName
                :profile="{ name: profiles.current!, template: randomizer.currentTemplateName }"
            />
        </div>

        <template v-if="nonCurrentProfiles.length != 0">
            <h3>Other Profiles</h3>
            <div v-for="profile in nonCurrentProfiles" class="profile">
                <ProfileName :profile="profile" />
                <div class="spacer"></div>
                <AppButton icon="keyboard_arrow_right" @click="switchProfile" type="positive"
                    >Switch</AppButton
                >
                <AppButton icon="delete" @click="deleteProfile" type="destructive">
                    Delete
                </AppButton>
            </div>
        </template>

        <ProfileCreateDialog :open="profileDialogOpen" @close="profileDialogOpen = false" />

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
const profiles = useProfilesStore();

const config = useAppConfig();

const nonCurrentProfiles = computed(() =>
    profiles.allProfiles.filter((profile) => profile.name != profiles.current),
);

const profileDialogOpen = ref(false);

function showProfileCreateDialog() {
    profileDialogOpen.value = true;
}

function switchProfile() {
    // TODO
}

function deleteProfile() {
    // TODO
}
</script>

<style scoped lang="scss">
@use "~/assets/base";
@use "sass:color";

.settings {
    padding: 1rem;

    h1 {
        margin-top: 0;
    }
}

.row {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 0.5rem;
}

.profile {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.5rem;

    background-color: base.$accent-background;
    padding: 1rem;
    border-radius: 1rem;
}

.spacer {
    flex-grow: 1;
}
</style>
