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
            <AppButton
                icon="file_upload"
                @click="showImportDialog"
                :disabled="profiles.allProfiles.length >= 5"
            >
                Import data
            </AppButton>
            <em v-if="profiles.allProfiles.length >= 5">You have reached the profile limit!</em>
        </div>
        <div class="row"></div>

        <h3>Current Profile</h3>
        <div class="profiles-wrapper">
            <div class="profile">
                <ProfileName
                    :profile="{ name: profiles.current!, template: randomizer.currentTemplateName }"
                />
                <div class="spacer"></div>
                <AppButton icon="file_download" @click="exportProfile" type="positive">
                    Export backup
                </AppButton>
            </div>
        </div>

        <template v-if="nonCurrentProfiles.length > 0">
            <h3>Other Profiles</h3>
            <div class="profiles-wrapper">
                <div v-for="profile in nonCurrentProfiles" class="profile">
                    <ProfileName :profile="profile" />
                    <div class="spacer"></div>
                    <AppButton
                        icon="keyboard_arrow_right"
                        @click="switchProfile(profile.name)"
                        type="positive"
                    >
                        Switch
                    </AppButton>
                    <AppButton
                        icon="delete"
                        @click="deleteProfile(profile.name)"
                        type="destructive"
                    >
                        Delete
                    </AppButton>
                </div>
            </div>
        </template>

        <ProfileCreateDialog :open="profileDialogOpen" @close="profileDialogOpen = false" />
        <DataImportDialog :open="importDialogOpen" @close="importDialogOpen = false" />

        <h2>Debug Info</h2>
        <h3>XP Prediction</h3>
        <pre><code>{{ JSON.stringify(randomizer.predictedSkillXP) }}</code></pre>
        <h3>Version</h3>
        <div>{{ config.version }} ({{ config.buildID }})</div>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: "Settings",
});

const randomizer = useRandomizerStore();
const settings = useSettingsStore();
const profiles = useProfilesStore();

const config = useAppConfig();

const nonCurrentProfiles = computed(() =>
    profiles.allProfiles.filter((profile) => profile.name != profiles.current),
);

const profileDialogOpen = ref(false);
const importDialogOpen = ref(false);

const importDialogLoaded = ref(false);
watch(importDialogOpen, () => {
    importDialogLoaded.value ||= importDialogOpen.value;
});

function showProfileCreateDialog() {
    profileDialogOpen.value = true;
}

function showImportDialog() {
    importDialogOpen.value = true;
}

function switchProfile(newProfile: string) {
    profiles.current = newProfile;
}

async function exportProfile() {
    const saveData = localStorage.getItem(`profile:${profiles.current}`);
    if (!saveData) {
        throw new Error("Could not load current profile");
    }

    const encoder = new TextEncoder();
    const encodedHeader = encoder.encode("sdvpr_v1_packed;");

    const encodedSaveData = encoder.encode(saveData);
    const compressedSaveData = await ByteArrayUtils.compressData(encodedSaveData);
    const saveDataLength = ByteArrayUtils.encodeInteger(compressedSaveData.size);

    const templateParts: BlobPart[] = [];
    const template = localStorage.getItem(`profileTemplate:${profiles.current}`);
    if (template) {
        const encodedTemplate = encoder.encode(template);
        const compressedTemplate = await ByteArrayUtils.compressData(encodedTemplate);
        const templateLength = ByteArrayUtils.encodeInteger(compressedTemplate.size);

        templateParts.push(templateLength);
        templateParts.push(compressedTemplate);
    } else {
        // 0 bytes
        templateParts.push(ByteArrayUtils.encodeInteger(0));
    }

    const blob = new Blob([encodedHeader, ...templateParts, saveDataLength, compressedSaveData], {
        type: "application/octet-stream",
    });
    const blobURL = URL.createObjectURL(blob);

    console.log(blobURL);

    const link = document.createElement("a");
    link.href = blobURL;
    link.download = `${profiles.current}.randomizer`;
    link.click();
    URL.revokeObjectURL(blobURL);
}

function deleteProfile(name: string) {
    // TODO: make this into a nice dialog
    if (!window.confirm(`Are you sure you want to delete the profile '${name}'?`)) {
        return;
    }

    profiles.deleteProfile(name);
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

.profiles-wrapper {
    display: flex;
    flex-flow: column nowrap;
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
