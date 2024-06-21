<template>
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
            <AppButton
                icon="file_download"
                @click="exportProfile(profiles.current!)"
                type="positive"
            >
                Export backup
            </AppButton>
        </div>
    </div>

    <Panel
        v-if="templateHasMigrations(randomizer.currentTemplateName)"
        type="info"
        class="migration-notice"
    >
        <strong>You can migrate this profile to 1.6!</strong>
        <span>
            Just press the button and your save data will be converted for the new 1.6 content. This
            will also make a backup in case anything goes wrong.
        </span>
        <AppButton icon="upgrade" @click="migrateProfile" :disabled="migrating">Migrate</AppButton>
    </Panel>

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
                <AppButton icon="delete" @click="deleteProfile(profile.name)" type="destructive">
                    Delete
                </AppButton>
            </div>
        </div>
    </template>

    <ProfileCreateDialog :open="profileDialogOpen" @close="profileDialogOpen = false" />
    <DataImportDialog :open="importDialogOpen" @close="importDialogOpen = false" />
</template>

<script setup lang="ts">
const profiles = useProfilesStore();
const randomizer = useRandomizerStore();
const dialogs = useDialogs();

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

async function deleteProfile(name: string) {
    if (
        (await dialogs.confirm(
            "Confirm deletion",
            `Are you sure you want to delete the profile '${name}'? This is irreversible!`,
            ["Delete", "Keep"],
        )) == "ok"
    ) {
        profiles.deleteProfile(name);
    }
}

const migrating = ref(false);
async function migrateProfile() {
    migrating.value = true;

    // make a backup
    await exportProfile(profiles.current!);
    const saveData = randomizer.generateSaveData();
    const migration = findMigration(saveData);
    if (!migration) {
        migrating.value = false;
        return;
    }

    await applyMigration(randomizer, profiles, saveData, migration);

    migrating.value = false;
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

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

.migration-notice {
    margin-top: 1rem;
}

.spacer {
    flex-grow: 1;
}
</style>
