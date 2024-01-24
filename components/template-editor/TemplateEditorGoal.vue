<template>
    <tr class="goal">
        <td>
            <Goal :goal="goal" class="inline"></Goal>
        </td>

        <td class="small-hide">
            <code>{{ goal.id }}</code>
        </td>

        <td>
            <button class="plain-button material-icons">edit</button>
        </td>
        <td>
            <button class="plain-button material-icons">delete</button>
        </td>
    </tr>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal;
}>();
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
