<template>
    <div class="goal-wrapper">
        <img
            v-if="goal.imageURL"
            :src="goal.imageURL"
            :key="goal.imageURL"
            class="icon"
            role="presentation"
            loading="lazy"
        />
        <span>{{ goal.name }}</span>
        <span class="badge" v-if="repeatNumber && goal.multiplicity > 1">#{{ repeatNumber }}</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal;
    repeatNumber?: number;
}>();

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
    image-rendering: pixelated;

    margin-right: 0.3em;
}
</style>
