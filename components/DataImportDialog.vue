<template>
    <AppDialog title="Import Data" :open="open" @close="passEvent">
        <form @submit.prevent="submitForm">
            <label
                for="file-input"
                class="file-input"
                :class="{ dragging: isDragging || file }"
                @drop.prevent="handleFileDrop"
                @dragover.prevent=""
                @dragenter="isDragging = true"
                @dragleave="isDragging = false"
            >
                <span v-if="file">{{ file.name }}</span
                ><span v-else>Choose a backup file...</span>
            </label>
            <input
                type="file"
                id="file-input"
                class="file-input-internal"
                accept=".randomizer"
                @change="updateFileInput"
                ref="fileInput"
            />
            <div class="loading" v-if="fileContents && !parsedFile">Loading...</div>
            <div class="description" v-else>
                <template v-if="parsedFile?.type == 'invalid'">
                    Error: could not read file.
                </template>
                <template v-else-if="parsedFile?.type == 'backup'">Loaded backup file!</template>
            </div>
            <AppButton icon="add" :disabled="parsedFile != null">Import</AppButton>
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (event: "close"): void;
}>();

function passEvent() {
    emit("close");
}

interface ParsedFile {
    readonly type: string;
}

class InvalidFile implements ParsedFile {
    readonly type = "invalid";
}

class ParsedBackupFile implements ParsedFile {
    readonly type = "backup";

    template: string | null;
    profile: string;

    constructor(template: string | null, profile: string) {
        this.template = template;
        this.profile = profile;
    }

    static async parse(data: Uint8Array) {
        // strip the magic string
        data = data.slice(BACKUP_HEADER.length);
        const templateSize = ByteArrayUtils.decodeInteger(data.slice(0, 4));
        const compressedTemplate = data.slice(4, 4 + templateSize);
        if (compressedTemplate.length != templateSize) {
            console.log(compressedTemplate.length, templateSize);
            throw new Error("Bad template length");
        }
        data = data.slice(4 + templateSize);

        const profileSize = ByteArrayUtils.decodeInteger(data.slice(0, 4));
        const compressedProfile = data.slice(4, 4 + profileSize);
        if (compressedProfile.length != profileSize) {
            throw new Error("Bad save data length");
        }

        const decoder = new TextDecoder();

        const decompressedTemplate =
            compressedTemplate.length == 0
                ? null
                : decoder.decode(await ByteArrayUtils.decompressData(compressedTemplate));

        const decompressedProfile = decoder.decode(
            await ByteArrayUtils.decompressData(compressedProfile),
        );

        // validate parts
        let parsedTemplate = undefined;
        if (decompressedTemplate) {
            parsedTemplate = JSON.parse(decompressedTemplate);
            if (!validateTemplate(parsedTemplate)) {
                throw new Error("Invalid template");
            }
        }

        if (!validateProfileData(decompressedProfile, parsedTemplate)) {
            throw new Error("Invalid profile data");
        }

        return new ParsedBackupFile(decompressedTemplate, decompressedProfile);
    }
}

const BACKUP_HEADER = new TextEncoder().encode("sdvpr_v1_packed;");

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const file = ref<File | null>(null);
const fileContents = ref<ArrayBuffer | null>(null);
async function updateFileInput() {
    file.value = fileInput.value?.files?.item(0) ?? null;
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

    const view = new Uint8Array(fileContents.value);

    // test for backup magic
    let isBackup = true;
    for (let i = 0; i < BACKUP_HEADER.length; i++) {
        if (view[i] !== BACKUP_HEADER[i]) {
            isBackup = false;
        }
    }

    if (isBackup) {
        try {
            parsedFile.value = await ParsedBackupFile.parse(view);
            console.log(parsedFile.value);
        } catch (e) {
            console.log(e);
            parsedFile.value = new InvalidFile();
        }
        return;
    }

    parsedFile.value = new InvalidFile();
});

async function handleFileDrop(event: DragEvent) {
    file.value = event.dataTransfer?.items?.[0]?.getAsFile() ?? null;
    fileContents.value = (await file.value?.arrayBuffer()) ?? null;
}

function submitForm() {}
</script>

<style scoped lang="scss">
@use "~/assets/base";

.file-input-internal {
    opacity: 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
}

.file-input {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;

    width: min(90vw, 30rem);
    background-color: #333;

    padding: 1rem;
    border: 4px dashed var(--text);
    border-radius: 0.75rem;

    cursor: pointer;

    text-align: center;

    &::before {
        font-family: "Material Icons";
        content: "file_upload";
        font-size: 3rem;
    }

    &.dragging {
        border-color: base.$secondary-green;
    }
}

.description {
    margin: 0.5rem 0;
}
</style>