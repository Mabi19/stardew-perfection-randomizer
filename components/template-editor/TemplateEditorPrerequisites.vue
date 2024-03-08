<template>
    <div class="prereq-header">
        <span>{{ type }} of:</span>
        <div class="header-buttons">
            <PlainIconButton icon="create_new_folder" title="Create prerequisite group" />
            <PlainIconButton icon="add" title="Create prerequisite" />
        </div>
    </div>
    <ul class="prereq-list">
        <li v-for="req in value.all ?? value.any ?? []">
            <template v-if="'goal' in req"
                >{{ req.goal }}
                <template v-if="!req.goal.startsWith('#')"
                    >x{{ req.multiplicity ?? 1 }}</template
                ></template
            >
            <TemplateEditorPrerequisites :value="req" v-else />
        </li>
    </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
    value: PrerequisiteGroup;
}>();

const type = computed(() => {
    if ("all" in props.value) {
        return "all";
    } else {
        return "any";
    }
});
</script>

<style scoped lang="scss">
.prereq-header {
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 1rem;
}

.header-buttons {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.25rem;
}

.prereq-list {
    margin: 0;
    padding-left: 1rem;
    list-style-position: inside;
}
</style>
