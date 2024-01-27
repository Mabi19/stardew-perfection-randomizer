<template>
    <Teleport to="body">
        <div class="overlay-hack" v-if="template != null">
            <div class="row">
                <AppButton icon="save" @click="saveAndQuit">Save and quit</AppButton>
                <AppButton type="destructive" icon="close" @click="quitWithoutSaving"
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
                        v-for="goal in template.goals"
                        :goal="goal"
                    ></TemplateEditorGoal>
                </tbody>
            </table>
        </div>
    </Teleport>
    <Body class="overlay-hack-active" v-if="template != null" />
</template>

<script setup lang="ts">
defineExpose({
    start,
});

const emit = defineEmits<{
    finish: [newTemplate: Template];
}>();

const template = ref<Template | null>(null);
const reverseDependencies = computed(() => {
    if (!template.value) {
        return {};
    }

    const result: Record<string, string[]> = {};
    for (const goal of template.value.goals) {
        const id = goal.id;
        const prerequisites = goal.prerequisites.all ?? goal.prerequisites.any ?? [];
        for (const req of prerequisites) {
            const target = req.goal;
            if (!(target in result)) {
                result[target] = [];
            }
            result[target].push(id);
        }
    }

    return result;
});

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
    // pop up "Are you sure?" dialog
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
    padding: 1rem;
    display: flex;
    flex-flow: column nowrap;
    gap: 0.5rem;
}

.row {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 0.5rem;
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
