export const KEY_MODIFIERS = {
    CTRL: 1,
};

export function useKeyboardShortcut(key: string, modifiers: number, callback: () => void) {
    const abortController = new AbortController();

    document.addEventListener("keydown", (event) => {
        let applies = true;

        if (modifiers & KEY_MODIFIERS.CTRL) {
            applies = applies && event.ctrlKey;
        }

        if (event.key == key) {
            callback();
        }
    });

    onUnmounted(() => abortController.abort());
}
