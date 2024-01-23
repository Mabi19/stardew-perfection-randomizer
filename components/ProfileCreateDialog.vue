<template>
    <AppDialog
        title="Create a Profile"
        :open="open"
        @close="passEvent"
        v-if="!templateEditorActive"
    >
        <form @submit.prevent="submitForm">
            <ol class="task-list">
                <li>
                    <label for="template">Select the template</label>
                    <select id="template" v-model="template" autofocus>
                        <option value="standard">Standard Mode</option>
                        <option value="hardcore">Hardcore Mode</option>
                        <option value="custom" v-if="customTemplate != null">Custom</option>
                    </select>
                    <AppButton @click="openTemplateEditor()" icon="edit">Customize</AppButton>
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
            <AppButton icon="add">Create</AppButton>
        </form>
    </AppDialog>
    <TemplateEditor ref="templateEditor" @finish="finishTemplateEditor" />
</template>

<script setup lang="ts">
import type { TemplateEditor } from "#components";

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (event: "close"): void;
}>();

function passEvent() {
    emit("close");
}
const profilesStore = useProfilesStore();

const template = ref("standard");
const profileName = ref("");

const defaultProfileName = computed(() => {
    const templateNames = {
        standard: "Standard",
        hardcore: "Hardcore",
        custom: "Custom",
    };

    // Check for already existing profile names.
    return profilesStore.findGoodProfileName(
        `${templateNames[template.value as keyof typeof templateNames] || "<unknown>"} Randomizer`,
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
    profilesStore.createProfile({
        template: template.value,
        name: profileName.value || defaultProfileName.value,
    });
}

// template editor stuff
const templateEditorActive = ref(false);
const templateEditor = ref<InstanceType<typeof TemplateEditor> | null>(null);
const customTemplate = ref<Template | null>(null);
function openTemplateEditor() {
    templateEditorActive.value = true;
    const templateToOpen =
        template.value == "custom" ? customTemplate.value : getPredefinedTemplate(template.value);
    if (templateToOpen != null) {
        templateEditor.value?.start(templateToOpen);
    }
}

function finishTemplateEditor(newTemplate: Template) {
    templateEditorActive.value = false;
    customTemplate.value = newTemplate;
    template.value = "custom";
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

        select,
        input {
            margin-top: 0.25rem;
            display: block;
            width: 100%;
        }

        :deep(button) {
            margin-top: 0.5rem;
        }
    }
}
</style>
