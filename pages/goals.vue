<template>
    <div class="goals-wrapper">
        <GoalList></GoalList>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: "Goals",
});
</script>

<style scoped lang="scss">
.goals-wrapper {
    padding: 1rem;
}
</style>
