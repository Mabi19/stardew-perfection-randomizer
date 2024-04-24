interface StoragePersistenceWrapper {
    isPersistent: Ref<boolean>;
    request(): Promise<boolean>;
}

let _cache: StoragePersistenceWrapper | null = null;

export function useStoragePersistence(): StoragePersistenceWrapper {
    if (_cache) {
        return _cache;
    }

    if (!navigator.storage?.persist) {
        // dummy object
        _cache = {
            isPersistent: ref(true),
            async request() {
                return true;
            },
        };
        return _cache;
    }

    const isPersistent = ref(true);
    navigator.storage.persisted().then((result) => {
        console.log("initial persistence query returned", result);
        isPersistent.value = result;
    });

    _cache = {
        isPersistent,
        async request() {
            return navigator.storage.persist().then((result) => {
                isPersistent.value = result;
                console.log("persistence request returned", result);
                return result;
            });
        },
    };
    return _cache;
}
