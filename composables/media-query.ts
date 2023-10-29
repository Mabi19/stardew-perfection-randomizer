export function useMediaQuery(query: string) {
    const mediaQuery = window.matchMedia(query);
    const result = ref(mediaQuery.matches);

    const abortController = new AbortController();

    mediaQuery.addEventListener(
        "change",
        () => {
            console.log(`media query ${query} updated!`);
            result.value = window.matchMedia(query).matches;
        },
        {
            signal: abortController.signal,
        },
    );

    onUnmounted(() => abortController.abort());

    return result;
}
