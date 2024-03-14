<template>
    <div class="prereq-header">
        <span>{{ type }} of:</span>
        <div class="header-buttons">
            <PlainIconButton
                icon="create_new_folder"
                title="Create prerequisite group"
                @click="createFolder"
            />
            <PlainIconButton icon="add" title="Create prerequisite" @click="createPrerequisite" />
        </div>
    </div>
    <ul class="prereq-list">
        <li v-for="(req, idx) in value.all ?? value.any ?? []">
            <template v-if="'goal' in req"
                >{{ req.goal }}
                <template v-if="!req.goal.startsWith('#')"
                    >x{{ req.multiplicity ?? 1 }}</template
                ></template
            >
            <TemplateEditorPrerequisites :value="req" v-else @update="passUpdate(idx, $event)" />
        </li>
    </ul>
</template>

<script setup lang="ts">
import { prerequisiteCreationFunc } from "./template-editor-injects";

const props = defineProps<{
    value: PrerequisiteGroup;
}>();

const emit = defineEmits<{
    update: [data: PrerequisiteGroup];
}>();

const type = computed(() => {
    if ("all" in props.value) {
        return "all";
    } else {
        return "any";
    }
});

// To simplify data flow, all updates are performed on copies and propagated up,
// so that the prerequisites are only set in one place.
// This helper function allows for modifying the data easily under this paradigm.
function updateData(handler: (workCopy: Prerequisite[]) => void) {
    // get the list of children
    let workCopy: Prerequisite[];
    if (props.value.all) {
        workCopy = props.value.all;
    } else if (props.value.any) {
        workCopy = props.value.any;
    } else {
        return;
    }

    // clone
    workCopy = JSON.parse(JSON.stringify(workCopy));

    // call handler
    handler(workCopy);

    // wrap it again
    if (props.value.all) {
        emit("update", { all: workCopy });
    } else if (props.value.any) {
        emit("update", { any: workCopy });
    }
}

// Modify the data in-place, then pass it up
function passUpdate(idx: number, newData: Prerequisite) {
    updateData((workCopy) => {
        // swap out the data in our copy
        workCopy[idx] = newData;
    });
}

function createFolder() {
    const newData = JSON.parse(JSON.stringify(props.value));
    if (newData.all) {
        newData.all.push({ all: [] });
    } else if (newData.any) {
        newData.any.push({ all: [] });
    }
    emit("update", newData);
}

const triggerPrerequisiteDialog = inject(prerequisiteCreationFunc)!;

function createPrerequisite() {
    triggerPrerequisiteDialog()
        .then((newVal) => {
            updateData((workCopy) => {
                workCopy.push(newVal);
            });
        })
        .catch(/* do nothing */);
}
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
