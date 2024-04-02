<template>
    <ul class="tag-list">
        <TemplateEditorTag
            v-for="(contents, name) in tags"
            :name
            v-model="tags[name]"
            :required-by="reverseDeps[`#${name}`]"
            :template
        />
    </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
    reverseDeps: Record<string, Set<string>>;
    template: Template;
}>();

const tags = defineModel<Record<string, string[]>>({ required: true });
</script>

<style scoped lang="scss">
.tag-list {
    margin: 0;
}
</style>
