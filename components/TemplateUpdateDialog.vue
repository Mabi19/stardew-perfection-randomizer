<template>
    <AppDialog
        :open="open"
        :style="{ display: templateEditorActive ? 'none' : undefined }"
        @close="passFinishEvent"
        title="Edit goal definitions"
    >
        <p class="explanation">
            Note that changing your template mid-challenge will truncate any data that doesn't fit
            with the new goal definition. Using this feature will automatically make a backup of
            your current profile.
        </p>
        <form @submit.prevent="submitForm">
            <label for="template">Select new template:</label>
            <div>
                <TemplateSelector
                    v-model:id="templateID"
                    v-model:custom-template="customTemplate"
                    v-model:editor-active="templateEditorActive"
                    v-model:is-ok="templateIsOk"
                />
            </div>
            <AppButton icon="done" class="confirm" :disabled="!templateIsOk">Confirm</AppButton>
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    finish: [];
}>();

const randomizer = useRandomizerStore();
const profiles = useProfilesStore();

const templateID = ref<TemplateID | "url">("standard_1_6");
const customTemplate = ref<Template | null>(null);
const templateEditorActive = ref(false);
const templateIsOk = ref(true);

function passFinishEvent() {
    emit("finish");
}

async function submitForm() {
    // get template
    const template =
        templateID.value == "custom" || templateID.value == "url"
            ? customTemplate.value
            : await getPredefinedTemplate(templateID.value);

    if (!template) {
        console.log("Invalid custom template");
        return;
    }

    // create a migration and apply it
    const saveData = randomizer.generateSaveData();
    // if there's an existing migration like this, use that as it will have a better save fixer
    const existingMigration = findMigration(saveData);
    let migration: Migration =
        existingMigration?.to == templateID.value
            ? existingMigration
            : {
                  fixer: autofix,
                  to:
                      templateID.value == "custom" || templateID.value == "url"
                          ? template
                          : templateID.value,
              };

    await applyMigration(randomizer, profiles, saveData, migration);

    passFinishEvent();
}
</script>

<style scoped lang="scss">
.explanation {
    margin-top: 0;
}

.parse-output {
    margin: 0.5rem 0;
}

.confirm {
    margin-top: 0.5rem;
}
</style>
