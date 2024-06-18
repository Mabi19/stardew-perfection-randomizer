<template>
    <select id="template" v-model="templateID" autofocus>
        <option value="standard_1_6">Standard Mode</option>
        <option value="hardcore_1_6">Hardcore Mode</option>
        <option value="standard">Standard Mode (1.5)</option>
        <option value="hardcore">Hardcore Mode (1.5)</option>
        <option value="url">Use template from URL</option>
        <option value="custom" v-if="customTemplate != null">Custom</option>
    </select>
    <div class="template-url-picker" v-if="templateID == 'url'">
        <label for="template-url">Template file URL</label>
        <input type="url" id="template-url" required v-model="templateURL" />
    </div>
    <div class="template-url-status" v-if="templateURLStatus != URLTemplateStatus.NONE">
        {{ urlTemplateStatusMessages[templateURLStatus] }}
    </div>

    <AppButton
        @click.stop.prevent="openTemplateEditor()"
        icon="edit"
        class="dialog-button-margin"
        :disabled="templateID == 'url'"
        >Customize</AppButton
    >
    <!--
        TODO: refactor this so it works
        the dialog needs to hide itself when the template editor is up.
        however, this component is included inside the dialog, so the template editor would be hidden with it.
        so, the template editor will likely need to be extracted outside it
        this will be pain
    -->
    <TemplateEditor
        ref="templateEditor"
        @finish="finishTemplateEditor"
        @cancel="cancelTemplateEditor"
    />
</template>

<script setup lang="ts">
import type { TemplateEditor } from "#components";
import debounce from "lodash-es/debounce";

// defined via props-emits because this is a fake v-model
// (only receives values)
const props = defineProps<{
    editorActive: boolean;
}>();

const emit = defineEmits<{
    "update:editorActive": [active: boolean];
}>();

const templateID = defineModel<TemplateID | "url">("id", { required: true });
const customTemplate = defineModel<Template | null>("customTemplate", { required: true });

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

            customTemplate.value = urlTemplate;
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

// template editor stuff
const templateEditorActive = ref(false);
watch(templateEditorActive, () => emit("update:editorActive", templateEditorActive.value));
const templateEditor = ref<InstanceType<typeof TemplateEditor> | null>(null);
async function openTemplateEditor() {
    if (templateID.value == "url") {
        return;
    }

    templateEditorActive.value = true;
    const templateToOpen =
        templateID.value == "custom"
            ? customTemplate.value
            : await getPredefinedTemplate(templateID.value);
    if (templateToOpen != null) {
        templateEditor.value?.start(templateToOpen);
    }
}

function finishTemplateEditor(newTemplate: Template) {
    cancelTemplateEditor();
    customTemplate.value = newTemplate;
    templateID.value = "custom";
}

function cancelTemplateEditor() {
    templateEditorActive.value = false;
}
</script>

<style scoped lang="scss">
.template-url-picker {
    margin-top: 0.5rem;
    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
    align-items: center;
}
</style>
