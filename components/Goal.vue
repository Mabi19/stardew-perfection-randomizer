<template>
    <div class="goal-wrapper">
        <img :src="goal.imageURL" class="icon" role="presentation" loading="lazy" />
        <span>{{ goal.name }}</span>
        <span class="badge" v-if="showRepeatNumber && goal.multiplicity > 1"
            >#{{ store.completion[goal.id] + 1 }}</span
        >
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        goal: Goal;
        showRepeatNumber?: boolean;
    }>(),
    {
        showRepeatNumber: false,
    },
);

const store = useRandomizerStore();
</script>

<style scoped lang="scss">
.goal-wrapper {
    * {
        display: inline;
        vertical-align: middle;
    }
}

.goal-wrapper .badge {
    margin-left: 0.3em;
}

.icon {
    width: 1em;
    height: 1em;
    object-fit: contain;
    image-rendering: crisp-edges;

    margin-right: 0.3em;
}
</style>
