<template>
    <AppDialog
        :open="open && !templateEditorActive"
        @close="passFinishEvent"
        title="Update XP predictions"
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
                />
            </div>
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

const templateID = ref<TemplateID | "url">("standard_1_6");
const customTemplate = ref<Template | null>(null);
const templateEditorActive = ref(false);

function passFinishEvent() {
    emit("finish");
}

function submitForm() {
    console.log("closing");
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
</style>
