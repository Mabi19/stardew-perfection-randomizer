<template>
    <h1 class="part">Log</h1>
    <div class="part">Filters or something idk</div>
    <div class="part">
        <RecycleScroller
            class="goal-list-body"
            page-mode
            :buffer="300"
            :items="logEntries"
            :item-size="30"
            key-field="timestamp"
            v-slot="{ item }"
        >
            <LogEntry :entry="item" />
        </RecycleScroller>
    </div>
</template>

<script setup lang="ts">
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

useHead({
    title: "Log",
});

interface LogFilters {
    start: Date;
    end: Date;
}

const profiles = useProfilesStore();
const logStore = useLogStore();
const logEntries = shallowRef<LogEntry[]>([]);
watchEffect(async () => {
    if (logStore.isReady) {
        logEntries.value = await logStore.load(profiles.current!);
        console.log(logEntries.value);
    }
});
</script>

<style scoped lang="scss">
.part {
    margin: 1rem;
}
</style>
