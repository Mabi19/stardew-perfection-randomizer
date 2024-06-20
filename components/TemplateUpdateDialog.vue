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
                    v-model:is-ok="templateIsOK"
                />
            </div>
            <AppButton icon="done" class="confirm" :disabled="!templateIsOK">Confirm</AppButton>
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
const templateIsOK = ref(true);

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

    // make a backup
    await exportProfile(profiles.current!);
    // modify save data
    const saveData = randomizer.generateSaveData();
    autofix(template, saveData);
    saveData.templateName = templateID.value == "url" ? "custom" : templateID.value;
    // patch the store
    randomizer.currentGoalID = saveData.currentGoalID;
    randomizer.currentTemplateName = saveData.templateName;
    randomizer.predictedSkillXP = saveData.predictedSkillXP;
    randomizer.completion = saveData.completion;
    // set the template ID
    profiles.allProfiles.find((profile) => profile.name == profiles.current)!.template =
        saveData.templateName;

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
