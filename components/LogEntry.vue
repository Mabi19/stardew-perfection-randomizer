<template>
    <div class="log-entry">
        <span>{{ dateTimeFormat.format(entry.timestamp) }}:</span>
        <span class="material-icons">{{ types[entry.type].icon }}</span>
        <span>{{ types[entry.type].label }}</span>
        <Goal
            :goal="{ ...entry.goal, prerequisites: {}, xp: {} }"
            :repeat-number="entry.repeatNumber"
        />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    entry: LogEntry;
}>();

const types = {
    complete: {
        icon: "done",
        label: "Completed",
    },
    cancel: {
        icon: "block",
        label: "Cancelled",
    },
    mark: {
        icon: "check_box",
        label: "Marked",
    },
    unmark: {
        icon: "check_box_outline_blank",
        label: "Unmarked",
    },
} as const;

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
});
</script>

<style scoped lang="scss">
.log-entry {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.25rem;
    align-items: center;

    height: 30px;

    & > * {
        flex-shrink: 0;
        overflow: hidden;
        white-space: nowrap;
    }

    :deep(.goal-wrapper) {
        flex-shrink: 1;
        text-overflow: ellipsis;
    }
}

.material-icons {
    font-size: 1.25rem;
}
</style>
