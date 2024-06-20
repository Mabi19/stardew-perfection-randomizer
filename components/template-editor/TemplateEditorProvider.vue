<template>
    <slot />
    <TemplateEditor @finish="handleFinish" @cancel="handleCancel" ref="templateEditor" />
</template>

<script setup lang="ts">
import { TemplateEditor } from "#components";

const templateEditor = ref<InstanceType<typeof TemplateEditor> | null>(null);
let promise: {
    resolve: (template: Template) => void;
    reject: () => void;
} | null = null;

function handleFinish(template: Template) {
    promise?.resolve(template);
    promise = null;
}

function handleCancel() {
    promise?.reject();
    promise = null;
}

provide(templateEditorInjectKey, {
    start(template: Template) {
        if (promise) {
            promise.reject();
        }

        templateEditor.value?.start(template);
        return new Promise<Template>((resolve, reject) => {
            console.log("setting promise handlers");
            promise = {
                resolve,
                reject,
            };
        });
    },
});
</script>
