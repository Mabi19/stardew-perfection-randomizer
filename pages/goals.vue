<template>
    <div class="part" v-if="store.templateData.ruleset">
        This Randomizer uses {{ store.templateData.ruleset }} rules.
        <a href="https://bit.ly/RandomPerfection">Perfection Randomizer Rules Document</a>
    </div>
    <div class="part row">
        <label for="filter">Filter goals:</label>
        <input id="filter" type="search" v-model="searchTerm" ref="searchBox" />
    </div>
    <div class="part">
        <GoalList :search-term="searchTerm"></GoalList>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: "Goals",
});

const store = useRandomizerStore();

const searchTerm = ref("");
const searchBox = ref<HTMLInputElement | null>(null);

useKeyboardShortcut(KEY_MODIFIERS.CTRL, "F", () => searchBox.value?.focus());
</script>

<style scoped lang="scss">
.part {
    margin: 1rem;
}
</style>
