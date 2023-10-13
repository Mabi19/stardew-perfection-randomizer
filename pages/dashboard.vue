<template>
    <div>
        <div class="status">
            Current Goal: {{ store.currentGoal }}
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