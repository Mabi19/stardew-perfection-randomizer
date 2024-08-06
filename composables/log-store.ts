export interface LogEntry {
    profile: string;
    timestamp: Date;
    type: "complete" | "mark" | "unmark" | "cancel";
    goal: {
        id: string;
        name: string;
        multiplicity: number;
        imageURL?: string;
    };
    repeatNumber?: number;
}

export const useLogStore = defineStore("log", () => {
    const isReady = ref(false);
    const isError = ref(false);

    const dbRequest = window.indexedDB.open("sdvpr-log");
    let db: IDBDatabase | undefined = undefined;
    dbRequest.addEventListener("error", () => (isError.value = true));
    dbRequest.addEventListener("upgradeneeded", (event: IDBVersionChangeEvent) => {
        // init
        // @ts-ignore
        const db = event.target.result as IDBDatabase;

        const logStore = db.createObjectStore("log", { keyPath: "timestamp" });
        logStore.createIndex("profile", "profile");
    });
    dbRequest.addEventListener("success", (event) => {
        // @ts-ignore
        db = event.target.result as IDBDatabase;
        isReady.value = true;
    });

    function load(
        profile: string,
        sort: "ascending" | "descending",
        start?: Date,
        end?: Date,
    ): Promise<LogEntry[]> {
        if (!db) {
            return Promise.reject(new Error("DB not initialized"));
        }

        return new Promise((resolve) => {
            const result: LogEntry[] = [];

            let bound: IDBKeyRange | undefined;
            const hasStart = start && !isNaN(start.valueOf());
            const hasEnd = end && !isNaN(end.valueOf());
            if (hasStart) {
                if (hasEnd) {
                    bound = IDBKeyRange.bound(start, end);
                } else {
                    bound = IDBKeyRange.lowerBound(start);
                }
            } else {
                if (hasEnd) {
                    bound = IDBKeyRange.upperBound(end);
                } else {
                    bound = undefined;
                }
            }

            const logStore = db!.transaction(["log"], "readonly").objectStore("log");
            logStore.openCursor(bound, sort == "ascending" ? "next" : "prev").onsuccess = (
                event,
            ) => {
                // @ts-ignore
                const cursor: IDBCursorWithValue | undefined = event.target.result;
                if (cursor) {
                    // @ts-ignore
                    const entry: LogEntry = cursor.value;
                    if (entry.profile == profile) {
                        result.push(entry);
                    }

                    cursor.continue();
                } else {
                    resolve(result);
                }
            };
        });
    }

    function addEntry(entry: LogEntry) {
        if (!db) {
            console.warn("Entry added without DB init, will be lost");
            return;
        }

        const logStore = db.transaction(["log"], "readwrite").objectStore("log");
        logStore.add(entry);
    }

    async function deleteEntriesForProfile(profile: string): Promise<void> {
        if (!db) {
            console.warn("Entries deleted without DB init, will not be applied");
            return;
        }

        const logStore = db.transaction(["log"], "readwrite").objectStore("log");
        const request = logStore.index("profile").getAllKeys(profile);
        return new Promise((resolve) => {
            request.onsuccess = () => {
                const keysToDelete = request.result;

                if (keysToDelete.length == 0) {
                    console.log("No log entries to delete");
                    resolve();
                }

                let processed = 0;
                const finishDelete = () => {
                    processed++;
                    if (processed == keysToDelete.length) {
                        console.log(`Deleted ${processed} log entries`);
                        resolve();
                    }
                };

                for (const key of keysToDelete) {
                    const deleteRequest = logStore.delete(key);
                    deleteRequest.onsuccess = finishDelete;
                    deleteRequest.onerror = finishDelete;
                }
            };
        });
    }

    return {
        isReady,
        isError,
        // actions
        load,
        addEntry,
        deleteEntriesForProfile,
    };
});
