<template>
    <AppDialog
        title="Create a Profile"
        :open="open"
        @close="passEvent"
        :style="{ display: templateEditorActive ? 'none' : undefined }"
    >
        <form @submit.prevent="submitForm">
            <ol class="task-list">
                <li>
                    <label for="template">Select the template</label>
                    <div>
                        <TemplateSelector
                            v-model:id="templateID"
                            v-model:custom-template="customTemplate"
                            v-model:editor-active="templateEditorActive"
                        />
                    </div>
                </li>
                <li>
                    <label for="profile-name">Name your profile</label>
                    <input
                        id="profile-name"
                        :placeholder="defaultProfileName"
                        maxlength="32"
                        v-model.trim="profileName"
                        ref="nameInput"
                    />
                </li>
            </ol>
            <AppButton icon="add" class="dialog-button-margin">Create</AppButton>
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (event: "close"): void;
    (event: "finish"): void;
}>();

function passEvent() {
    emit("close");
}
const profilesStore = useProfilesStore();
const profileName = ref("");

const templateID = ref<TemplateID | "url">("standard_1_6");
const customTemplate = ref<Template | null>(null);
const templateEditorActive = ref(false);

const defaultProfileName = computed(() => {
    // Check for already existing profile names.
    return profilesStore.findGoodProfileName(
        `${templateID.value == "url" ? "Custom" : templateNames[templateID.value] || "<unknown>"} Randomizer`,
    );
});

const nameInput = ref<HTMLInputElement | null>(null);

watch(profileName, () => {
    if (profilesStore.profileExists(profileName.value)) {
        nameInput.value?.setCustomValidity("Name already in use");
    } else {
        nameInput.value?.setCustomValidity("");
    }
});

function submitForm() {
    let usedTemplate: Template | undefined = undefined;
    if (templateID.value == "custom" || templateID.value == "url") {
        if (!customTemplate.value) {
            return;
        }
        usedTemplate = customTemplate.value;
    }

    emit("finish");

    profilesStore.createProfile({
        template: templateID.value == "url" ? "custom" : templateID.value,
        customTemplate: usedTemplate,
        name: profileName.value || defaultProfileName.value,
    });
}
</script>

<style scoped lang="scss">
.task-list {
    padding-left: 0;
    margin-top: 0;

    display: flex;
    flex-flow: column nowrap;
    gap: 0.75rem;

    li {
        list-style-type: decimal;
        list-style-position: inside;

        input {
            margin-top: 0.25rem;
            display: block;
            width: 100%;
        }
    }
}
</style>
