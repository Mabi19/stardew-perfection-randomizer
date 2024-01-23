<template>
    <Teleport to="body">
        <div class="overlay-hack">XD</div>
    </Teleport>
    <Body class="overlay-hack-active" v-if="active" />
</template>

<script setup lang="ts">
const props = defineProps<{
    active: boolean;
}>();

defineExpose();

function start(template: Template) {}

// unload guards

function unloadHandler(ev: BeforeUnloadEvent) {
    ev.preventDefault();
    ev.returnValue = true;
}

watchEffect(() => {
    if (props.active) {
        window.addEventListener("beforeunload", unloadHandler);
    } else {
        window.removeEventListener("beforeunload", unloadHandler);
    }
});

const removeJSNavigationHook = useRouter().beforeResolve((_to) => {
    if (props.active) {
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
}

// Hide everything while the template editor's active.
:global(.overlay-hack-active .layout) {
    display: none;
}
</style>
