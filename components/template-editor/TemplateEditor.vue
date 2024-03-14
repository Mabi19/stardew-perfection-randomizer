<template>
    <Teleport to="body">
        <div class="overlay-hack" v-if="template != null">
            <div class="main-view">
                <div class="row">
                    <AppButton icon="save" @click="saveAndQuit">Save and quit</AppButton>
                    <AppButton type="destructive" icon="block" @click="quitWithoutSaving"
                        >Quit without saving</AppButton
                    >
                </div>
                <div class="row">
                    <label for="template-ruleset">Ruleset</label>
                    <select id="template-ruleset" v-model="template.ruleset">
                        <option value="hardcore">Hardcore</option>
                        <option value="standard">Standard</option>
                        <option :value="undefined">Unspecified</option>
                    </select>
                </div>
                <h2 class="header">Goals</h2>
                <table class="goal-list">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th class="small-hide">ID</th>
                            <th><!-- edit button --></th>
                            <th><!-- delete button --></th>
                        </tr>
                    </thead>
                    <tbody>
                        <TemplateEditorGoal
                            v-for="(goal, idx) in template.goals"
                            :goal="goal"
                            @edit="handleEdit(idx)"
                            @delete="handleDelete(idx)"
                        ></TemplateEditorGoal>
                    </tbody>
                </table>
            </div>

            <TemplateEditorPane v-if="template" :template ref="goalDialog" />
        </div>
    </Teleport>
    <Body class="overlay-hack-active" v-if="template != null" />
</template>

<script setup lang="ts">
import { reverseGoalDependencies } from "./template-editor-injects";
import { TemplateEditorPane } from "#components";

defineExpose({
    start,
});

const emit = defineEmits<{
    finish: [newTemplate: Template];
}>();

// Traverse the prerequisite tree, returning all of the dependencies of this set of prerequisites
// (including tags and their contents)
function* traversePrerequisites(reqs: Prerequisite): Generator<string, void, void> {
    if ("goal" in reqs) {
        // single goal
        if (reqs.goal.startsWith("#")) {
            // tag: yield it and its contents (both are required)
            yield reqs.goal;
            for (const goal of template.value!.tags[reqs.goal.slice(1)]) {
                yield goal;
            }
        } else {
            yield reqs.goal;
        }
    } else {
        // prerequisite list
        const list = reqs.all ?? reqs.any ?? [];
        for (const req of list) {
            yield* traversePrerequisites(req);
        }
    }
}

function* getGoalDependencies(goal: Goal) {
    for (const skill of Object.keys(goal.xp)) {
        yield `level:${skill}`;
    }
    yield* traversePrerequisites(goal.prerequisites);
}

const template = ref<Template | null>(null);
const reverseDeps = computed(() => {
    if (!template.value) {
        return {};
    }

    const result: Record<string, Set<string>> = {};
    for (const goal of template.value.goals) {
        const id = goal.id;
        for (const target of getGoalDependencies(goal)) {
            if (!(target in result)) {
                result[target] = new Set();
            }
            result[target].add(id);
        }
    }

    for (const [name, values] of Object.entries(template.value.tags)) {
        const referenceName = `#${name}`;
        for (const target of values) {
            if (!(target in result)) {
                result[target] = new Set();
            }
            result[target].add(referenceName);
        }
    }

    return result;
});
provide(reverseGoalDependencies, reverseDeps);
const goalDialog = ref<InstanceType<typeof TemplateEditorPane> | null>();

function start(baseTemplate: Template) {
    template.value = structuredClone(baseTemplate);
}

function saveAndQuit() {
    if (template.value) {
        if (!validateTemplate(template.value)) {
            // TODO: Rework this into a custom dialog
            window.alert("Template is invalid.");
            return;
        }

        // go through JSON to get rid of reactivity
        emit("finish", JSON.parse(JSON.stringify(template.value)));
        template.value = null;
    }
}

function quitWithoutSaving() {
    // TODO: pop up "Are you sure?" dialog
}

// editing actions

function handleEdit(goalIndex: number) {
    goalDialog.value!.setBaseGoal(template.value!.goals[goalIndex]);
}

function handleDelete(goalIndex: number) {
    template.value!.goals.splice(goalIndex, 1);
}

// unload guards

function unloadHandler(ev: BeforeUnloadEvent) {
    ev.preventDefault();
    ev.returnValue = true;
}

watchEffect(() => {
    if (template.value) {
        window.addEventListener("beforeunload", unloadHandler);
    } else {
        window.removeEventListener("beforeunload", unloadHandler);
    }
});

const removeJSNavigationHook = useRouter().beforeResolve((_to) => {
    if (template.value) {
        if (!window.confirm("You have unsaved changes! Are you sure you want to exit?")) {
            return false;
        }
    }
});

onUnmounted(() => {
    window.removeEventListener("beforeunload", unloadHandler);
    removeJSNavigationHook();
});
</script>

<style scoped lang="scss">
.overlay-hack {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.5rem;

    height: 100vh;
    overflow: hidden;
}

.main-view {
    padding: 1rem;
    display: flex;
    flex-flow: column nowrap;
    gap: 0.5rem;
    flex-grow: 1;

    overflow: auto;
}

.header {
    margin: 0.25rem 0;
}

.goal-list {
    border-spacing: 0;
    border-collapse: collapse;
    width: max-content;
    max-width: 100%;
}

// Hide everything while the template editor's active.
:global(.overlay-hack-active .layout) {
    display: none;
}
</style>
