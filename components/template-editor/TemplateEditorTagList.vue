<template>
    <ul class="tag-list">
        <TemplateEditorTag
            v-for="(_contents, name) in tags"
            :name
            :required-by="reverseDeps[`#${name}`] ?? new Set()"
            :template
            v-model="tags[name]!"
            @delete="deleteTag(name)"
        />
    </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
    reverseDeps: Record<string, Set<string>>;
    template: Template;
}>();

const tags = defineModel<Record<string, string[]>>({ required: true });

function deleteTag(name: string) {
    delete tags.value[name];
}
</script>

<style scoped lang="scss">
.tag-list {
    margin: 0;
}
</style>
