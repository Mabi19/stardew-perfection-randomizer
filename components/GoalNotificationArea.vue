<template>
    <div class="notification-area">
        <TransitionGroup>
            <div class="button-group" :key="-1" v-if="showHistoryButtons">
                <AppButton :disabled="undoCount == 0" icon="undo" @click="handleUndoAction">
                    Undo
                </AppButton>
                <AppButton :disabled="redoCount == 0" icon="redo" @click="handleRedoAction">
                    Redo
                </AppButton>
            </div>
            <div class="notification" v-for="notification in notifications" :key="notification.id">
                {{ notification.type }} goal <Goal :goal="notification.goal" class="inline-goal" />
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
interface AppNotification {
    id: number;
    type: string;
    goal: Goal;
}

const props = defineProps<{
    undoCount: number;
    redoCount: number;
}>();

const emit = defineEmits<{
    (event: "undoButton"): void;
    (event: "redoButton"): void;
}>();

const notifications = ref<AppNotification[]>([]);
let nextID = 0;

function send(type: string, goal: Goal) {
    notifications.value.push({ id: nextID, type, goal });

    const id = nextID;
    setTimeout(() => {
        const index = notifications.value.findIndex((notification) => notification.id == id);
        if (index != -1) {
            notifications.value.splice(index, 1);
        }
    }, 8000);

    nextID++;
}

const showHistoryButtons = computed(() => props.undoCount > 0 || props.redoCount > 0);

function handleUndoAction() {
    // The ability to undo is not tied to the top notification.
    // However, if one exists, it should be popped off to signify that the task is undone.
    // We don't have to check here because the latest undo-generating event (including redos) gets the newest, or top, notification.
    notifications.value.pop();
    emit("undoButton");
}

function handleRedoAction() {
    emit("redoButton");
}

defineExpose({
    send,
    handleUndoAction,
    handleRedoAction,
});
</script>

<style scoped lang="scss">
@use "~/assets/base";

.notification-area {
    position: absolute;
    top: 0;
    right: 0;

    z-index: 3;
    padding: 0.5rem;

    display: flex;
    flex-flow: column-reverse nowrap;
    align-items: flex-end;
    gap: 0.5rem;

    width: 100vw;

    // do not prevent clicks on other stuff
    pointer-events: none;
    * {
        // ... but be able to click the notifications themselves
        pointer-events: auto;
    }
}

@keyframes notification-progress {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(0);
    }
}

.notification {
    background-color: var(--background-light);
    padding: 0.5rem;
    // add space for bottom bar
    padding-bottom: 0.75rem;
    border-radius: 0.5rem;
    // border: 2px solid base.$panel-border;

    width: 25rem;
    max-width: 100%;

    position: relative;
    overflow: hidden;

    &::after {
        content: "";

        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;

        height: 0.25rem;
        background-color: base.$secondary-green;

        animation: notification-progress 8s linear;
    }
}

.inline-goal {
    display: inline;
    font-weight: bold;
    :deep(span) {
        vertical-align: baseline;
    }
}

.notification,
.button-group {
    box-shadow: 5px 5px 3px 1px rgba(0, 0, 0, 0.4);
}

.button-group {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.5rem;
}

.v-move,
.v-enter-active,
.v-leave-active {
    transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    transform: translateY(-100%);
    // override dark mode button
    opacity: 0 !important;
}

.v-leave-active {
    position: absolute;
}
</style>
