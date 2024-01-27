<template>
    <tr class="goal">
        <td>
            <Goal :goal="goal" class="inline"></Goal>
        </td>

        <td class="small-hide">
            <code>{{ goal.id }}</code>
        </td>

        <td>
            <PlainIconButton icon="edit" />
        </td>
        <td>
            <PlainIconButton icon="delete" :disabled="!canMutate" />
        </td>
    </tr>
</template>

<script setup lang="ts">
import { reverseGoalDependencies } from "./reverse-dep-inject";

const props = defineProps<{
    goal: Goal;
}>();

const reverseDependencies = inject(reverseGoalDependencies)!;
const canMutate = computed(() => !(props.goal.id in reverseDependencies.value));
</script>

<style scoped lang="scss">
.goal * {
    vertical-align: middle;
}

.goal td {
    border-top: 1px solid var(--text);
    padding: 0.25rem;
}

.inline {
    display: contents;
}
</style>
