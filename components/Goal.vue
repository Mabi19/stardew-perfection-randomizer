<template>
    <div class="goal-wrapper">
        <img :src="goal.imageURL" class="icon" alt="Goal icon">
        <div class="goal-name">
            <span>{{ goal.name }}</span>
            <span class="badge" v-if="showRepeatNumber && goal.multiplicity > 1">#{{ store.completion[goal.id] + 1 }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    goal: Goal,
    showRepeatNumber: boolean,
}>(), {
    showRepeatNumber: false
});

const store = useAppStore();
</script>

<style scoped lang="scss">
.goal-wrapper {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.3em;
    align-items: center;
}

.goal-name .badge {
    margin-left: 0.3em;
}

.icon {
    width: 1em;
    height: 1em;
    object-fit: contain;
}
</style>