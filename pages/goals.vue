<template>
    <div>
        <GoalList></GoalList>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '~/composables/app-store';

const store = useAppStore();

</script>