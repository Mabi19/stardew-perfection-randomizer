<template>
    <h1 class="part">Log</h1>
    <div class="part">// TODO: filters</div>
    <div class="part" v-if="logStore.isError">
        An error occurred! Please report this and refresh the page to try again!
    </div>
    <div class="part" v-if="isLoading">Loading...</div>
    <div class="part" v-else>
        <RecycleScroller
            v-if="logEntries.length"
            class="log-list-body"
            page-mode
            :buffer="300"
            :items="logEntries"
            :item-size="30"
            key-field="timestamp"
            v-slot="{ item }"
        >
            <LogEntry :entry="item" />
        </RecycleScroller>
        <div class="log-list-body" v-else>
            <template v-if="laxFilters"
                >Goals you've completed or cancelled will appear here</template
            >
            <template v-else>There are no entries to display</template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

useHead({
    title: "Log",
});

interface LogFilters {
    start?: Date;
    end?: Date;
    sort: "ascending" | "descending";
}

const filters = ref<LogFilters>({
    sort: "descending",
});

const laxFilters = computed(() => {
    return filters.value.start == undefined && filters.value.end == undefined;
});

const profiles = useProfilesStore();
const logStore = useLogStore();

const logEntries = shallowRef<LogEntry[]>([]);
const isLoading = ref(false);
watchEffect(async () => {
    if (logStore.isReady) {
        isLoading.value = true;
        logEntries.value = await logStore.load(
            profiles.current!,
            filters.value.sort,
            filters.value.start,
            filters.value.end,
        );
        isLoading.value = false;
    }
});
</script>

<style scoped lang="scss">
.part {
    margin: 1rem;
}
</style>
