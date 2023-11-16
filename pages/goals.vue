<template>
    <div class="part row">
        <label for="filter">Filter goals:</label>
        <input id="filter" type="search" v-model="searchTerm" />
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
