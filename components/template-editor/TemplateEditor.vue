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

// Hide everything while the template editor's active.
:global(.overlay-hack-active .layout) {
    display: none;
}
</style>
