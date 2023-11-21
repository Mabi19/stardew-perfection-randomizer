export const KEY_MODIFIERS = {
    CTRL: 1,
};

export function useKeyboardShortcut(modifiers: number, key: string, callback: () => void) {
    const abortController = new AbortController();

    document.addEventListener("keydown", (event) => {
        let applies = true;

        if (modifiers & KEY_MODIFIERS.CTRL) {
            applies = applies && event.ctrlKey;
        }

        if (event.key.toUpperCase() == key) {
            event.preventDefault();
            callback();
        }
    });

    onUnmounted(() => abortController.abort());
}
