<template>
    <Teleport to="body">
        <div class="overlay-hack" v-if="template != null">
            <div class="main-view">
                <div class="row">
                    <AppButton icon="save" @click="saveAndQuit">Save and quit</AppButton>
                    <AppButton icon="verified" @click="validate">Validate template</AppButton>
                    <i v-if="validationState != null">
                        <template v-if="validationState">Everything OK!</template>
                        <template v-else>
                            Template invalid.
                            <!-- TODO: show reason -->
                        </template>
                    </i>
                    <div class="divider"></div>
                    <AppButton type="secondary" icon="block" @click="quitWithoutSaving"
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

                <TabSwitcher :options="['Goals', 'Tags']" v-model="currentTab" />

                <template v-if="currentTab == 'Goals'">
                    <h2 class="header">Goals</h2>
                    <div class="row">
                        <AppButton icon="add" @click="createNewGoal">Create new goal</AppButton>
                    </div>

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
                                :required-by="reverseDeps[goal.id]"
                                @edit="handleEdit(idx)"
                                @delete="handleDelete(idx)"
                            ></TemplateEditorGoal>
                        </tbody>
                    </table>
                </template>
                <template v-else>
                    <h2 class="header">Tags</h2>
                    <div class="row">
                        <AppButton icon="add" @click="createNewTag">Create new tag</AppButton>
                    </div>
                    <TemplateEditorTagList :reverseDeps :template v-model="template.tags" />
                </template>
            </div>

            <TemplateEditorPane
                v-if="template"
                :template
                :goalsByID
                :reverseDeps
                ref="goalPane"
                @finish-editing="replaceGoal"
                @finish-create="addNewGoal"
            />
        </div>
    </Teleport>

    <TemplateEditorGoalPicker
        :active="goalSelectorActive"
        :disqualified="goalSelectorDisqualified"
        :template
        :goalsByID
        :use-multiplicity="goalSelectorUseMultiplicity"
        v-if="template"
        @finish="finishGoalSelector"
        @cancel="cancelGoalSelector"
    />

    <AppDialog
        title="Create new tag"
        :open="tagNameDialogActive"
        @close="tagNameDialogActive = false"
    >
        <form @submit.prevent="finishNewTag">
            <div class="row">
                <label for="new-tag-name">Name:</label>
                <span>
                    #
                    <input
                        type="text"
                        id="new-tag-name"
                        v-model="newTagName"
                        pattern="[a-z0-9_:]+"
                        v-invalid="newTagName in (template?.tags ?? {}) ? 'Tag already exists' : ''"
                    />
                </span>
            </div>
            <AppButton icon="add" class="dialog-button-margin">Create</AppButton>
        </form>
    </AppDialog>

    <Body class="overlay-hack-active" v-if="template != null" />
</template>

<script setup lang="ts">
import { TemplateEditorPane } from "#components";
import { goalSelectorFunc } from "./template-editor-injects";
import { vInvalid, type Template } from "#imports";

defineExpose({
    start,
});

const emit = defineEmits<{
    finish: [newTemplate: Template];
    cancel: [];
}>();

const dialogs = useDialogs();

const currentTab = ref("Goals");

// Traverse the prerequisite tree, returning all of the dependencies of this set of prerequisites
// (including tags and their contents)
function* traversePrerequisites(reqs: Prerequisite): Generator<string, void, void> {
    if ("goal" in reqs) {
        // single goal
        if (reqs.goal.startsWith("#")) {
            // tag: yield it and its contents (both are required)
            yield reqs.goal;
            for (const goal of template.value!.tags[reqs.goal.slice(1)] ?? []) {
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
            result[target]!.add(id);
        }
    }

    for (const [name, values] of Object.entries(template.value.tags)) {
        const referenceName = `#${name}`;
        for (const target of values) {
            if (!(target in result)) {
                result[target] = new Set();
            }
            result[target]!.add(referenceName);
        }
    }

    return result;
});
const goalsByID = computed(() =>
    template.value ? Object.fromEntries(template.value.goals.map((goal) => [goal.id, goal])) : {},
);
const goalPane = ref<InstanceType<typeof TemplateEditorPane> | null>();
watch(currentTab, () => goalPane.value?.cancelEditing());

function start(baseTemplate: Template) {
    template.value = structuredClone(baseTemplate);
}

function saveAndQuit() {
    if (template.value) {
        if (!validateTemplate(template.value)) {
            dialogs.alert("Error", "Template is invalid.");
            return;
        }

        // go through JSON to get rid of reactivity
        emit("finish", JSON.parse(JSON.stringify(template.value)));
        template.value = null;
    }
}

const validationState = ref<boolean | null>(null);
watch(template, () => (validationState.value = null), { deep: true });
function validate() {
    validationState.value = template.value && validateTemplate(template.value);
}

async function quitWithoutSaving() {
    if (
        (await dialogs.confirm("Warning", "Are you sure you want to quit?", ["Yes", "No"])) == "ok"
    ) {
        template.value = null;
        emit("cancel");
    }
}

// editing actions

function createNewGoal() {
    goalPane.value!.createNewGoal();
}

function handleEdit(goalIndex: number) {
    const goal = template.value!.goals[goalIndex];
    if (goal) goalPane.value!.setBaseGoal(goal);
}

function handleDelete(goalIndex: number) {
    template.value!.goals.splice(goalIndex, 1);
}

// pane finish handlers

function replaceGoal(goal: Goal) {
    const existingIdx = template.value!.goals.findIndex((testGoal) => testGoal.id == goal.id);
    console.assert(existingIdx != -1, "Could not find goal to replace");
    template.value!.goals[existingIdx] = goal;
}

function addNewGoal(goal: Goal) {
    template.value!.goals.push(goal);
}

// tag things

const tagNameDialogActive = ref(false);
const newTagName = ref("");

function createNewTag() {
    tagNameDialogActive.value = true;
    newTagName.value = "";
}

function finishNewTag() {
    template.value!.tags[newTagName.value] = [];
    tagNameDialogActive.value = false;
}

// goal selector dialog
// Extracted out to minimize amount of dialogs in the DOM
let goalSelectorCallbacks: {
    resolve: (v: SinglePrerequisite) => void;
    reject: () => void;
} | null = null;
// used to queue up multiple dialogs, though that should never happen
let goalSelectorPromise: Promise<SinglePrerequisite> | null = null;

const goalSelectorActive = ref(false);
const goalSelectorDisqualified = ref(new Set<string>());
const goalSelectorUseMultiplicity = ref(false);

async function triggerGoalSelector(
    disqualified: Set<string>,
    useMultiplicity: boolean,
): Promise<SinglePrerequisite> {
    // wait for previous to finish (if it somehow came up)
    if (goalSelectorPromise) {
        await goalSelectorPromise;
    }

    const promise = new Promise<SinglePrerequisite>((resolve, reject) => {
        goalSelectorActive.value = true;
        goalSelectorDisqualified.value = disqualified;
        goalSelectorUseMultiplicity.value = useMultiplicity;
        goalSelectorCallbacks = { resolve, reject };
    });
    goalSelectorPromise = promise;

    return promise;
}

function finishGoalSelector(result: SinglePrerequisite) {
    goalSelectorActive.value = false;
    goalSelectorCallbacks?.resolve(result);
    goalSelectorCallbacks = null;
    goalSelectorPromise = null;
}

function cancelGoalSelector() {
    goalSelectorActive.value = false;
    goalSelectorCallbacks?.reject();
    goalSelectorCallbacks = null;
    goalSelectorPromise = null;
}

provide(goalSelectorFunc, triggerGoalSelector);

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
        // This has to be a native confirm because we need to block here
        if (!window.confirm("You have unsaved changes! Are you sure you want to quit?")) {
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

.divider {
    display: none;
}

@media (min-width: 750px) {
    .divider {
        display: block;
        border-right: 1px solid var(--text-light);
        height: 1.5em;
    }
}

// Hide everything while the template editor's active.
:global(.overlay-hack-active .layout) {
    display: none;
}
</style>
