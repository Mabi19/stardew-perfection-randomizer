<template>
    <span
        >{{ prerequisites.all ? "All" : "Any" }} of:
        {{ store.isPrerequisiteMet(prerequisites) ? "✅" : "❌" }}</span
    >
    <ul v-if="!isEmpty">
        <li v-for="req in prerequisites.all ?? prerequisites.any ?? []">
            <template v-if="'goal' in req">
                <Goal
                    v-if="store.goals?.[req.goal]"
                    :goal="store.goals[req.goal]!"
                    class="inline"
                />
                <!-- this is required for tags to work -->
                <code v-else>{{ req.goal }}</code>
                <span v-if="req.multiplicity && req.multiplicity > 1" class="inline-goal-mult">
                    (x{{ req.multiplicity }})
                </span>
                <span class="prerequisite-status">{{
                    store.isPrerequisiteMet(
                        req,
                        prerequisites.all ? Array.prototype.every : Array.prototype.some,
                    )
                        ? "✅"
                        : "❌"
                }}</span>
            </template>
            <!-- recurse down -->
            <GoalListPrerequisites v-else :prerequisites="req" />
        </li>
    </ul>
    <span v-else>&lt;none&gt;</span>
</template>

<script setup lang="ts">
const props = defineProps<{
    prerequisites: PrerequisiteGroup;
}>();

const store = useRandomizerStore();

const isEmpty = computed(() => {
    return Object.keys(props.prerequisites).length == 0;
});
</script>

<style scoped lang="scss">
.inline {
    display: inline;
}

.inline-goal-mult {
    vertical-align: middle;
}

.prerequisite-status {
    margin-left: 0.25rem;
    vertical-align: middle;
}
</style>
