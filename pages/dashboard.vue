<template>
    <div class="dashboard">
        <div class="status">
            <span>Current Goal: </span>
            <Goal class="current-goal" v-if="store.currentGoal" :goal="store.currentGoal" :show-repeat-number="true"/>
            <span v-else>null</span>
        </div>
        <div class="controls">
            <button @click="rollGoal">Generate Goal</button>
        </div>
    </div>
</template>

<script setup lang="ts">
const store = useAppStore();

function rollGoal() {
    store.rollGoal();
}
</script>

<style scoped lang="scss">
.current-goal {
    font-size: 3rem;
    font-weight: bold;
}

.dashboard {
    display: grid;
    place-items: center;
}
</style>