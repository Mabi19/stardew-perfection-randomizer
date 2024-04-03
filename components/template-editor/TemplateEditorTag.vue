<template>
    <li class="tag">
        <details class="tag-wrapper" :open @toggle="open = $event.target.open">
            <summary class="name">
                <code>#{{ name }}</code>
                <span>({{ contents.length }} entries)</span>
                <PlainIconButton icon="add" title="Add tag entry" @click="addEntry" />
                <PlainIconButton
                    icon="delete"
                    :title="cannotDeleteMessage"
                    @click="$emit('delete')"
                    :disabled="requiredBy.size > 0 || contents.length > 0"
                />
            </summary>
            <ul class="contents" v-if="contents.length > 0">
                <li v-for="(child, idx) in contents" class="contents-entry">
                    <code>
                        {{ child }}
                    </code>
                    <PlainIconButton
                        icon="delete"
                        title="Delete tag entry"
                        @click="deleteEntry(idx)"
                        class="delete-button"
                    />
                </li>
            </ul>
            <div class="contents" v-else>&lt;no entries&gt;</div>
        </details>
    </li>
</template>

<script setup lang="ts">
import { goalSelectorFunc } from "./template-editor-injects";

const props = defineProps<{
    name: string;
    requiredBy: Set<string>;
    template: Template;
}>();

const emit = defineEmits<{
    delete: [];
}>();

const contents = defineModel<string[]>({ required: true });
const open = ref(false);

const triggerGoalSelector = inject(goalSelectorFunc)!;

const cannotDeleteMessage = computed(() => {
    if (props.requiredBy.size > 0) {
        return `This tag is required by ${Array.from(props.requiredBy)
            .map((id) => "`" + id + "`")
            .join(", ")}.`;
    } else if (contents.value.length > 0) {
        return "Cannot delete tag with contents";
    } else {
        return "Delete tag";
    }
});

const disqualifiedGoals = computed(
    () =>
        new Set([
            ...Object.keys(props.template.tags).map((tagName) => `#${tagName}`),
            ...contents.value,
        ]),
);

function addEntry() {
    open.value = true;

    triggerGoalSelector(disqualifiedGoals.value, false)
        .then(({ goal }) => {
            contents.value.push(goal);
        })
        .catch(/* do nothing */);
}

function deleteEntry(idx: number) {
    contents.value.splice(idx, 1);
}
</script>

<style scoped lang="scss">
.name {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.25em;
    align-items: center;
}

.tag {
    margin-top: 0.5rem;
    list-style-type: disclosure-closed;
    &:has(.tag-wrapper[open]) {
        list-style-type: disclosure-open;
    }
}

.contents {
    list-style-position: inside;
    background-color: var(--background-light);
    border-radius: 1rem;
    width: max-content;
    max-width: 100%;
    padding: 0.5rem 1rem;
}

.contents-entry * {
    vertical-align: middle;
}

.delete-button {
    margin-left: 0.25rem;
}
</style>
