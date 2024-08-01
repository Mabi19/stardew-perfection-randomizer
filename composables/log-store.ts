export interface LogEntry {
    profile: string;
    timestamp: Date;
    type: "complete" | "mark" | "unmark" | "cancel";
    goal: {
        id: string;
        name: string;
        imageURL?: string;
    };
    repeat?: number;
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

    function load(profile: string, start?: Date, end?: Date): Promise<LogEntry[]> {
        if (!db) {
            return Promise.reject(new Error("DB not initialized"));
        }

        return new Promise((resolve) => {
            const result: LogEntry[] = [];

            const logStore = db!.transaction(["log"], "readonly").objectStore("log");
            logStore.openCursor().onsuccess = (event) => {
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
                    console.log(result);
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

        const logStore = db!.transaction(["log"], "readwrite").objectStore("log");
        logStore.add(entry);
    }

    function deleteEntriesForProfile(profile: string) {
        // TODO: remove from IDB
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
