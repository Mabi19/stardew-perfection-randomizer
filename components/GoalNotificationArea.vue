<template>
    <div class="notification-area">
        <TransitionGroup>
            <AppButton
                :key="-1"
                v-if="props.showUndoButton"
                icon="undo"
                class="undo-button"
                @click="handleUndoButton"
            >
                Undo
            </AppButton>
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
    showUndoButton: boolean;
}>();

const emit = defineEmits<{
    (event: "undoButton"): void;
}>();

const notifications = ref<AppNotification[]>([]);
let nextID = 0;

function send(type: string, goal: Goal) {
    notifications.value.push({ id: nextID, type, goal });
    nextID++;

    setTimeout(() => notifications.value.shift(), 5000);
}

function handleUndoButton() {
    // The ability to undo is not tied to the top notification.
    // However, if one exists, it should be popped off to signify that the task is undone.
    notifications.value.pop();
    emit("undoButton");
}

defineExpose({
    send,
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

.notification {
    background-color: var(--background-light);
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 2px solid base.$panel-border;

    width: 25rem;
    max-width: 100%;
}

.inline-goal {
    display: inline;
    font-weight: bold;
    :deep(span) {
        vertical-align: baseline;
    }
}

.notification,
.undo-button {
    box-shadow: 5px 5px 3px 1px rgba(0, 0, 0, 0.4);
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
