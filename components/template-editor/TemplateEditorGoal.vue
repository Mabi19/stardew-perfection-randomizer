<template>
    <tr class="goal">
        <td>
            <Goal :goal="goal" class="unwrap"></Goal>
        </td>

        <td class="small-hide">
            <code>{{ goal.id }}</code>
        </td>

        <td>
            <PlainIconButton icon="edit" @click="editGoal" title="Edit goal" />
        </td>
        <td>
            <PlainIconButton
                icon="delete"
                :class="{ disabled: deleteBlocked }"
                :title="cannotDeleteMessage"
                @click="deleteGoal"
            />
        </td>
    </tr>
</template>

<script setup lang="tsx">
const props = defineProps<{
    goal: Goal;
    requiredBy?: Set<string>;
}>();

const emit = defineEmits<{
    edit: [];
    delete: [];
}>();

const dialogs = useDialogs();

const deleteBlocked = computed(() => {
    return props.requiredBy && props.requiredBy.size > 0;
});

const cannotDeleteMessage = computed(() => {
    if (deleteBlocked.value) {
        return `This goal is required by ${Array.from(props.requiredBy!)
            .map((id) => "`" + id + "`")
            .join(", ")}.`;
    } else {
        return undefined;
    }
});

function editGoal() {
    emit("edit");
}

function deleteGoal() {
    if (deleteBlocked.value) {
        const requiredBy = Array.from(props.requiredBy!);

        dialogs.alert("Error", () => [
            <span>
                This goal is required by&nbsp;
                {requiredBy.map((id, index) => (
                    <>
                        <code>{id}</code>
                        {index < requiredBy.length - 1 ? ", " : ""}
                    </>
                ))}
                .
            </span>,
        ]);
    } else {
        if (confirm(`Are you sure you want to delete \`${props.goal.id}\`?`)) {
            emit("delete");
        }
    }
}
</script>

<style scoped lang="scss">
.goal * {
    vertical-align: middle;
}

.goal td {
    border-top: 1px solid var(--text);
    padding: 0.25rem;
}

.unwrap {
    display: contents;
}
</style>
