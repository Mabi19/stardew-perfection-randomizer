<template>
    <div class="dashboard">
        <div class="main">
            <span>Current Goal: </span>
            <Goal
                class="cur-goal-name"
                v-if="store.currentGoal"
                :goal="store.currentGoal"
                :show-repeat-number="true"
            />
            <span v-else>null</span>
            <div class="controls">
                <button @click="rollGoal">Generate Goal</button>
                <button @click="finishGoal">Finish Goal</button>
            </div>
        </div>
        <div class="completion">
            <div class="progress-bar" :style="progressFill"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
const store = useAppStore();

function rollGoal() {
    store.rollGoal();
}

function finishGoal() {
    store.finishGoal();
}

const progressFill = computed(() => ({
    "--fill": `${(100 * store.completedCount) / store.totalCount}%`,
}));
</script>

<style scoped lang="scss">
@use "~/assets/base";

.main {
    flex-grow: 1;
}

.cur-goal-name {
    font-size: 3rem;
    font-weight: bold;
}

.dashboard {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;
}

.progress-bar {
    width: 100%;
    transform: translateX(calc(-100% + var(--fill)));
    transition: transform 1s ease-out;

    height: 0.5rem;
    border-top-right-radius: 0.5rem;

    background-color: base.$accent;
    color: whitesmoke;
}
</style>
