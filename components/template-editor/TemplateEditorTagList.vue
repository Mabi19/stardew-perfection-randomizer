<template>
    <ul class="tag-list">
        <TemplateEditorTag
            v-for="(contents, name) in tags"
            :name
            :contents
            :required-by="reverseDeps[`#${name}`]"
        />
    </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
    reverseDeps: Record<string, Set<string>>;
}>();

const tags = defineModel<Record<string, string[]>>({ required: true });
</script>

<style scoped lang="scss">
.tag-list {
    margin: 0;
}
</style>
