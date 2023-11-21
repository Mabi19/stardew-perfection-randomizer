<template>
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

const searchTerm = ref("");
const searchBox = ref<HTMLInputElement | null>(null);

useKeyboardShortcut(KEY_MODIFIERS.CTRL, "F", () => searchBox.value?.focus());
</script>

<style scoped lang="scss">
.part {
    margin: 1rem;
}

.row {
    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
}
</style>
