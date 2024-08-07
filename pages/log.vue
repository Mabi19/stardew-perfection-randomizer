<template>
    <h1 class="part">Log</h1>
    <StoragePersistenceWarning />
    <div class="part">
        <div class="row">
            <label for="filter-start">From</label>
            <input id="filter-start" type="date" v-model="filters.start" />
        </div>
        <div class="row">
            <label for="filter-end">To</label>
            <input id="filter-end" type="date" v-model="filters.end" />
        </div>
        <div class="row">
            <label for="filter-sort">Sort</label>
            <select id="filter-sort" v-model="filters.sort">
                <option value="descending">Latest first</option>
                <option value="ascending">Earliest first</option>
            </select>
        </div>
    </div>
    <div class="part row">
        <AppButton icon="file_download" @click="exportAsCSV">Export as CSV</AppButton>
        <AppButton icon="delete_forever" type="destructive" @click="clearLog">Clear log</AppButton>
    </div>
    <div class="part" v-if="logStore.isError">
        An error occurred! Please report this and refresh the page to try again!
    </div>
    <div class="part" v-if="!logStore.isReady || isLoading">Loading...</div>
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
    start?: string;
    end?: string;
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

/** Assumes the date is in `<input type="date">` format (YYYY-MM-DD) */
function parseDateInLocalTime(dateString: string) {
    const parts = dateString.split("-").map((part) => parseInt(part, 10));
    if (parts.length < 3) {
        throw new Error("Invalid date format");
    }

    return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
}

watchEffect(async () => {
    if (logStore.isReady) {
        const startDate = filters.value.start
            ? parseDateInLocalTime(filters.value.start)
            : undefined;
        const endDate = filters.value.end ? parseDateInLocalTime(filters.value.end) : undefined;
        // This makes the endDate inclusive
        endDate?.setHours(23, 59, 59, 999);

        if (startDate && isNaN(startDate.valueOf())) {
            return;
        }

        if (endDate && isNaN(endDate.valueOf())) {
            return;
        }

        if (startDate && endDate && endDate.valueOf() < startDate.valueOf()) {
            // end is before start, there are no entries which satisfy that
            logEntries.value = [];
            return;
        }

        isLoading.value = true;
        logEntries.value = await logStore.load(
            profiles.current!,
            filters.value.sort,
            startDate,
            endDate,
        );
        isLoading.value = false;
    }
});

const dialogs = useDialogs();
async function clearLog() {
    if (
        (await dialogs.confirm(
            "Confirm log deletion",
            "Are you sure you want to delete all the logs for this profile?",
            ["Yes", "No"],
        )) == "ok"
    ) {
        await logStore.deleteEntriesForProfile(profiles.current!);
        // trigger a rerender
        triggerRef(filters);
    }
}

function quoteCSVValue(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
}

const filenameDateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
});
async function exportAsCSV() {
    const rows = ["Timestamp,Goal,Type"];
    for (const entry of logEntries.value) {
        rows.push(
            [entry.timestamp.toISOString(), entry.goal.name, entry.type]
                .map((value) => quoteCSVValue(value))
                .join(","),
        );
    }

    const content = rows.join("\n");

    let datePart: string;
    if (filters.value.start) {
        if (filters.value.end) {
            datePart = ` ${filenameDateFormatter.formatRange(parseDateInLocalTime(filters.value.start), parseDateInLocalTime(filters.value.end))}`;
        } else {
            datePart = ` from ${filenameDateFormatter.format(parseDateInLocalTime(filters.value.start))}`;
        }
    } else {
        if (filters.value.end) {
            datePart = ` until ${filenameDateFormatter.format(parseDateInLocalTime(filters.value.end))}`;
        } else {
            datePart = "";
        }
    }

    downloadBlob(new Blob([content]), `Log for ${profiles.current}${datePart}.csv`);
}
</script>

<style scoped lang="scss">
.part {
    margin: 1rem;
}

.log-list-body {
    min-width: 500px;
}
</style>
