<template>
    <table class="goal-list" v-if="filteredGoals.length > 0">
        <thead>
            <tr>
                <th>Comp.</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <ListGoal v-for="goal in filteredGoals" :goal="goal"></ListGoal>
        </tbody>
    </table>
    <div v-else>No goals matching filter!</div>
</template>

<script setup lang="ts">
const props = defineProps<{
    searchTerm: string;
}>();

const store = useRandomizerStore();

const filteredGoals = computed(() => {
    const lowerSearchTerm = props.searchTerm.toLowerCase();

    if (lowerSearchTerm.length < 4) {
        return store.templateData.goals;
    }

    return store.templateData.goals.filter((goal) =>
        goal.name.toLowerCase().includes(lowerSearchTerm),
    );
});
</script>
