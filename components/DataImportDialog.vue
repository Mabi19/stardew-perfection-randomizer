<template>
    <AppDialog title="Import Data" :open="open" @close="passEvent">
        <p class="explanation">
            To import your data from the spreadsheet version, select File &rarr; Download &rarr;
            Microsoft Excel (.xlsx) and select the resulting file below.
        </p>
        <form @submit.prevent="submitForm">
            <FileInput
                @change="updateFile"
                accept=".randomizer, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .bin, application/octet-stream"
                >Choose a backup or spreadsheet export file...</FileInput
            >
            <div class="loading" v-if="fileContents && !parsedFile">Loading...</div>
            <div class="description" v-else>
                <template v-if="parsedFile?.type == 'invalid'">
                    Error: could not read file.
                    <code>{{ parsedFile.errorInfo ?? "(no extended error information)" }}</code>
                </template>
                <template v-else-if="parsedFile?.type == 'backup'">Loaded backup file!</template>
            </div>

            <label for="imported-profile-name">Name your profile</label>
            <input
                id="imported-profile-name"
                type="text"
                maxlength="32"
                v-model="profileName"
                ref="nameInput"
                :placeholder="defaultProfileName"
            />

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
    (event: "finish"): void;
}>();

function passEvent() {
    emit("close");
}

const BACKUP_HEADER = new TextEncoder().encode("sdvpr_v1_packed;");
const SPREADSHEET_HEADER = new TextEncoder().encode("PK");

class InvalidFile {
    readonly type = "invalid";
    errorInfo?: string;

    constructor(error?: string) {
        this.errorInfo = error;
    }
}

class ParsedBackupFile {
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
                throw new Error("Template did not validate.");
            }
        }

        if (!(await validateProfileData(decompressedProfile, parsedTemplate))) {
            throw new Error("Invalid profile data");
        }

        return new ParsedBackupFile(decompressedTemplate, decompressedProfile);
    }
}

class ParsedSpreadsheetFile {
    readonly type = "spreadsheet";

    template: string | null;
    profile: string;

    constructor(template: string | null, profile: string) {
        this.template = template;
        this.profile = profile;
    }

    static async parse(data: Uint8Array) {
        const module = await import("~~/spreadsheet-import/parse");

        const { profileString, templateString } = await module.parseSpreadsheet(data);

        const parsedFile = new ParsedSpreadsheetFile(templateString, profileString);

        let parsedTemplate = undefined;
        if (templateString) {
            parsedTemplate = JSON.parse(templateString);
            if (!validateTemplate(parsedTemplate)) {
                throw new Error("Converted template does not validate");
            }
        }

        if (!(await validateProfileData(profileString, parsedTemplate))) {
            throw new Error("Converted profile does not validate");
        }

        return parsedFile;
    }
}

async function importFileContents(fileContents: ArrayBuffer) {
    const view = new Uint8Array(fileContents);

    // test for backup magic
    let isBackup = true;
    for (let i = 0; i < BACKUP_HEADER.length; i++) {
        if (view[i] !== BACKUP_HEADER[i]) {
            isBackup = false;
        }
    }

    if (isBackup) {
        parsedFile.value = await ParsedBackupFile.parse(view);
        return;
    }

    let isSpreadsheet = true;
    for (let i = 0; i < SPREADSHEET_HEADER.length; i++) {
        if (view[i] !== SPREADSHEET_HEADER[i]) {
            isSpreadsheet = false;
        }
    }

    if (isSpreadsheet) {
        parsedFile.value = await ParsedSpreadsheetFile.parse(view);
        return;
    }

    parsedFile.value = new InvalidFile();
}

type ParsedFile = InvalidFile | ParsedBackupFile | ParsedSpreadsheetFile;

const file = ref<File | null>(null);
const fileContents = ref<ArrayBuffer | null>(null);
async function updateFile(newFile: File | null) {
    file.value = newFile;
    fileContents.value = (await file.value?.arrayBuffer()) ?? null;
}

// Can't use computed here because async
const parsedFile = ref<ParsedFile | null>(null);

const profilesStore = useProfilesStore();
const profileName = ref("");
const nameInput = ref<HTMLInputElement | null>();
watch(profileName, () => {
    if (profilesStore.profileExists(profileName.value)) {
        nameInput.value?.setCustomValidity("Name already in use");
    } else {
        nameInput.value?.setCustomValidity("");
    }
});
const defaultProfileName = computed(() => {
    const baseName = file.value?.name?.split(".")?.[0];
    if (!baseName) return undefined;
    return profilesStore.findGoodProfileName(baseName);
});

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

    emit("finish");

    profilesStore.importProfile({
        name: (profileName.value || defaultProfileName.value)!.trim(),
        profileData: parsedFile.value.profile,
        templateData: parsedFile.value.template,
    });
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

#imported-profile-name {
    display: block;
    margin-bottom: 1rem;
    width: 100%;
}

.description {
    margin: 0.5rem 0;
}

.explanation {
    margin-top: 0;
}
</style>
