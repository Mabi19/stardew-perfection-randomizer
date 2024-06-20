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
        :disabled="templateID == 'url' && templateURLStatus != URLTemplateStatus.OK"
        >Customize</AppButton
    >
</template>

<script setup lang="ts">
import debounce from "lodash-es/debounce";

// defined via props-emits because this is a fake v-model
// (only receives values)
const props = defineProps<{
    editorActive: boolean;
    isOk: boolean;
}>();

const emit = defineEmits<{
    "update:editorActive": [active: boolean];
    "update:isOk": [ok: boolean];
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
const templateEditor = useTemplateEditor();
async function openTemplateEditor() {
    if (templateID.value == "url" && customTemplate.value != null) {
        return;
    }

    templateEditorActive.value = true;
    const templateToOpen =
        templateID.value == "custom" || templateID.value == "url"
            ? customTemplate.value
            : await getPredefinedTemplate(templateID.value);
    if (templateToOpen != null) {
        try {
            const newTemplate = await templateEditor.start(templateToOpen);
            customTemplate.value = newTemplate;
            templateID.value = "custom";
        } catch (_) {
            console.log("template editor cancelled");
        }
        templateEditorActive.value = false;
    }
}

watch(templateEditorActive, () => emit("update:editorActive", templateEditorActive.value));
watch([templateID, templateURLStatus, customTemplate], () => {
    if (templateID.value == "url") {
        emit("update:isOk", templateURLStatus.value == URLTemplateStatus.OK);
    } else if (templateID.value == "custom") {
        emit("update:isOk", customTemplate.value != null);
    } else {
        // predefined template, always available
        emit("update:isOk", true);
    }
});
watch(templateID, () => {
    if (templateID.value != "url") {
        templateURLStatus.value = URLTemplateStatus.NONE;
    }
});
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
