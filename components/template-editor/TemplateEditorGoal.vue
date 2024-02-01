<template>
    <tr class="goal">
        <td>
            <Goal :goal="goal" class="unwrap"></Goal>
        </td>

        <td class="small-hide">
            <code>{{ goal.id }}</code>
        </td>

        <td>
            <PlainIconButton icon="edit" @click="editGoal" />
        </td>
        <td>
            <PlainIconButton
                icon="delete"
                :class="{ disabled: !canMutate }"
                :title="cannotDeleteMessage"
                @click="deleteGoal"
            />
        </td>
    </tr>
</template>

<script setup lang="ts">
import { reverseGoalDependencies } from "./reverse-dep-inject";

const props = defineProps<{
    goal: Goal;
}>();

const emit = defineEmits<{
    delete: [];
}>();

const reverseDependencies = inject(reverseGoalDependencies)!;
const canMutate = computed(() => !(props.goal.id in reverseDependencies.value));
const cannotDeleteMessage = computed(() => {
    if (!canMutate.value) {
        return `This goal is required by ${reverseDependencies.value[props.goal.id]
            .map((id) => "`" + id + "`")
            .join(", ")}.`;
    } else {
        return undefined;
    }
});

function editGoal() {
    console.log(canMutate.value, cannotDeleteMessage.value);
}

function deleteGoal() {
    // TODO: replace these with custom dialogs
    if (!canMutate.value) {
        alert(cannotDeleteMessage.value);
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
