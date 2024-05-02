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
                        <option value="standard_1_6">Standard Mode</option>
                        <option value="hardcore_1_6">Hardcore Mode</option>
                        <option value="standard">Standard Mode (1.5)</option>
                        <option value="hardcore">Hardcore Mode (1.5)</option>
                        <option value="url">Use template from URL</option>
                        <option value="custom" v-if="customTemplate != null">Custom</option>
                    </select>
                    <div class="template-url-picker" v-if="template == 'url'">
                        <label for="template-url">Template file URL</label>
                        <input type="url" id="template-url" required v-model="templateURL" />
                    </div>
                    <div
                        class="template-url-status"
                        v-if="templateURLStatus != URLTemplateStatus.NONE"
                    >
                        {{ urlTemplateStatusMessages[templateURLStatus] }}
                    </div>

                    <AppButton
                        @click="openTemplateEditor()"
                        icon="edit"
                        class="dialog-button-margin"
                        :disabled="template == 'url'"
                        >Customize</AppButton
                    >
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
    <TemplateEditor
        ref="templateEditor"
        @finish="finishTemplateEditor"
        @cancel="cancelTemplateEditor"
    />
</template>

<script setup lang="ts">
import type { TemplateEditor } from "#components";
import debounce from "lodash-es/debounce";

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

const template = ref<TemplateID | "url">("standard");
const profileName = ref("");

enum URLTemplateStatus {
    // Everything OK
    OK,
    // No URL entered
    NONE,
    // Loading
    LOADING,
    // URL is invalid
    INVALID_URL,
    // Network-type error (e.g. 404)
    ERROR_NETWORK,
    // Not a valid template
    ERROR_INVALID_TEMPLATE,
}

const urlTemplateStatusMessages = {
    [URLTemplateStatus.OK]: "Everything OK!",
    [URLTemplateStatus.NONE]: "",
    [URLTemplateStatus.LOADING]: "Loading...",
    [URLTemplateStatus.INVALID_URL]: "Error: invalid URL",
    [URLTemplateStatus.ERROR_NETWORK]: "Error: can't load template; is the URL correct?",
    [URLTemplateStatus.ERROR_INVALID_TEMPLATE]: "Error: template is invalid",
};

const templateURL = ref("");
const debouncedTemplateURL = ref("");
watch(
    templateURL,
    debounce(() => (debouncedTemplateURL.value = templateURL.value), 300, {}),
);
const templateURLStatus = ref(URLTemplateStatus.NONE);
const loadedURLTemplate = shallowRef<Template | null>(null);
watch(debouncedTemplateURL, async () => {
    if (debouncedTemplateURL.value == "") {
        templateURLStatus.value = URLTemplateStatus.NONE;
        return;
    }

    try {
        const url = new URL(debouncedTemplateURL.value);
        templateURLStatus.value = URLTemplateStatus.LOADING;

        try {
            const templateJSON = await fetch(url).then((response) => response.text());
            const urlTemplate = JSON.parse(templateJSON);
            console.log(urlTemplate);

            if (!validateTemplate(urlTemplate)) {
                templateURLStatus.value = URLTemplateStatus.ERROR_INVALID_TEMPLATE;
            }

            loadedURLTemplate.value = urlTemplate;
            templateURLStatus.value = URLTemplateStatus.OK;
        } catch (e) {
            console.log(e);
            templateURLStatus.value = URLTemplateStatus.ERROR_NETWORK;
        }
    } catch (e) {
        console.log(e);
        templateURLStatus.value = URLTemplateStatus.INVALID_URL;
    }
});

const defaultProfileName = computed(() => {
    // Check for already existing profile names.
    return profilesStore.findGoodProfileName(
        `${template.value == "url" ? "Custom" : templateNames[template.value] || "<unknown>"} Randomizer`,
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
    emit("finish");

    let usedTemplate: Template | undefined = undefined;
    if (template.value == "custom") {
        if (!customTemplate.value) {
            return;
        }
        usedTemplate = customTemplate.value;
    } else if (template.value == "url") {
        if (!loadedURLTemplate.value || templateURLStatus.value != URLTemplateStatus.OK) {
            return;
        }
        usedTemplate = loadedURLTemplate.value;
    }

    profilesStore.createProfile({
        template: template.value == "url" ? "custom" : template.value,
        customTemplate: usedTemplate,
        name: profileName.value || defaultProfileName.value,
    });
}

// template editor stuff
const templateEditorActive = ref(false);
const templateEditor = ref<InstanceType<typeof TemplateEditor> | null>(null);
const customTemplate = shallowRef<Template | null>(null);
async function openTemplateEditor() {
    if (template.value == "url") {
        return;
    }

    templateEditorActive.value = true;
    const templateToOpen =
        template.value == "custom"
            ? customTemplate.value
            : await getPredefinedTemplate(template.value);
    if (templateToOpen != null) {
        templateEditor.value?.start(templateToOpen);
    }
}

function finishTemplateEditor(newTemplate: Template) {
    cancelTemplateEditor();
    customTemplate.value = newTemplate;
    template.value = "custom";
}

function cancelTemplateEditor() {
    templateEditorActive.value = false;
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
    }
}

.template-url-picker {
    margin-top: 0.5rem;
}
</style>
