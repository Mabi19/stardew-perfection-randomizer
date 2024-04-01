<template>
    <li class="tag">
        <details class="tag-wrapper" :open @toggle="open = $event.target.open">
            <summary class="name">
                <code>#{{ name }}</code>
                <span>({{ contents.length }} entries)</span>
                <PlainIconButton icon="add" title="Add tag entry" @click="addEntry" />
            </summary>
            <ul class="contents">
                <li v-for="child in contents">
                    <code>
                        {{ child }}
                    </code>
                </li>
            </ul>
        </details>
    </li>
</template>

<script setup lang="ts">
const props = defineProps<{
    name: string;
    contents: string[];
    requiredBy: Set<string>;
}>();

const open = ref(false);

function addEntry() {
    open.value = true;
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
</style>
