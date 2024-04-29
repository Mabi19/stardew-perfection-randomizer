<template>
    <AppDialog title="Import Data" :open="open" @close="passEvent">
        <form @submit.prevent="submitForm">
            <FileInput @change="updateFile" accept=".json, application/json"
                >Choose a template file...</FileInput
            >
            <div class="loading" v-if="fileContents && !parsedFile">Loading...</div>
            <div class="description" v-else>
                <template v-if="parsedFile?.type == 'invalid'">
                    Error: could not read file.
                    <code>{{ parsedFile.errorInfo ?? "(no extended error information)" }}</code>
                </template>
                <template v-else-if="parsedFile?.type == 'template'"
                    >Loaded template file!</template
                >
            </div>

            <AppButton icon="done" :disabled="!parsedFile || parsedFile.type == 'invalid'">
                Import
            </AppButton>
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (event: "close"): void;
    (event: "finish", newTemplate: Template): void;
}>();

function passEvent() {
    emit("close");
}

class InvalidFile {
    readonly type = "invalid";
    errorInfo?: string;

    constructor(error?: string) {
        this.errorInfo = error;
    }
}

class TemplateFile {
    readonly type = "template";
    template: Template;

    constructor(templateText: string) {
        this.template = JSON.parse(templateText);
        if (!validateTemplate(this.template)) {
            throw new Error("Template does not validate");
        }
    }
}

async function importFileContents(fileContents: ArrayBuffer) {
    const text = new TextDecoder().decode(fileContents);

    parsedFile.value = new TemplateFile(text);
}

type ParsedFile = InvalidFile | TemplateFile;

const file = ref<File | null>(null);
const fileContents = ref<ArrayBuffer | null>(null);
async function updateFile(newFile: File | null) {
    file.value = newFile;
    fileContents.value = (await file.value?.arrayBuffer()) ?? null;
}

// Can't use computed here because async
const parsedFile = ref<ParsedFile | null>(null);

watch(fileContents, async () => {
    console.log("parsing file");

    if (!fileContents.value) {
        parsedFile.value = null;
        return;
    }

    try {
        await importFileContents(fileContents.value);
    } catch (e) {
        const message = (e as Error).message;
        parsedFile.value = new InvalidFile(message);
    }
});

function submitForm() {
    if (!parsedFile.value || parsedFile.value.type == "invalid") {
        return;
    }

    emit("finish", parsedFile.value.template);
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

.description {
    margin: 0.5rem 0;
}
</style>
