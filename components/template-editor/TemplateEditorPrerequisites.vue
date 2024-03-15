<template>
    <div class="prereq-header">
        <span>
            <select :value="type" @change="changeGroupType">
                <option value="all">All</option>
                <option value="any">Any</option>
            </select>
            <span> of:</span>
        </span>
        <div class="header-buttons">
            <PlainIconButton
                icon="create_new_folder"
                title="Create prerequisite group"
                @click="createGroup"
            />
            <PlainIconButton icon="add" title="Create prerequisite" @click="createPrerequisite" />
            <div class="divider" />
            <PlainIconButton
                icon="delete"
                :title="`Delete prerequisite group${childCount > 0 ? ' (needs to be empty)' : ''}`"
                :disabled="childCount > 0"
                @click="deleteThisGroup"
            />
        </div>
    </div>
    <ul class="prereq-list">
        <li v-for="(req, idx) in value.all ?? value.any ?? []">
            <span v-if="'goal' in req" class="prerequisite">
                <span
                    >{{ req.goal }}
                    <template v-if="!req.goal.startsWith('#')"
                        >x{{ req.multiplicity ?? 1 }}</template
                    ></span
                >
                <PlainIconButton
                    icon="delete"
                    title="Delete prerequisite"
                    @click="deleteChild(idx)"
                />
            </span>
            <TemplateEditorPrerequisites
                :value="req"
                v-else
                @update="passUpdate(idx, $event)"
                @delete="deleteChild(idx)"
            />
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
    delete: [];
}>();

const type = computed(() => {
    if ("all" in props.value) {
        return "all";
    } else {
        return "any";
    }
});

const childCount = computed(() => {
    return props.value.all?.length ?? props.value.any?.length ?? 0;
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

function deleteChild(idx: number) {
    updateData((workCopy) => {
        workCopy.splice(idx, 1);
    });
}

function createGroup() {
    const newData = JSON.parse(JSON.stringify(props.value));
    if (newData.all) {
        newData.all.push({ all: [] });
    } else if (newData.any) {
        newData.any.push({ all: [] });
    }
    emit("update", newData);
}

function deleteThisGroup() {
    emit("delete");
}

function changeGroupType(ev: Event) {
    if (!ev.target) {
        return;
    }
    const value = (ev.target as HTMLSelectElement).value;
    if (value == type.value) {
        return;
    }

    if (props.value.all) {
        const data = JSON.parse(JSON.stringify(props.value.all));
        emit("update", { [value]: data });
    } else if (props.value.any) {
        const data = JSON.parse(JSON.stringify(props.value.any));
        emit("update", { [value]: data });
    }
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
.prereq-header,
.prerequisite {
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: center;
}

.prereq-header {
    gap: 1rem;
}

.prerequisite {
    gap: 0.25rem;
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

    li {
        width: max-content;
    }
}

.divider {
    height: 1rem;
    border-right: 1px solid #a48cb9;
    padding: 0;
}
</style>
