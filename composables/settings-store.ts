import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", () => {
    const selectedTheme = ref<string>(localStorage.getItem("settings:theme") ?? "system");
    watch(selectedTheme, () => {
        localStorage.setItem("settings:theme", selectedTheme.value);
    });

    const systemIsDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    const theme = computed(() =>
        // This is a mess of ternaries:
        // If theme is system, use "dark" if system prefers dark mode and light otherwise
        // If theme isn't system, just use it
        selectedTheme.value == "system"
            ? systemIsDarkMode.value
                ? "dark"
                : "light"
            : selectedTheme.value,
    );

    return {
        theme,
        selectedTheme,
    };
});
