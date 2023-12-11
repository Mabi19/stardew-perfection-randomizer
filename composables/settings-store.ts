import { defineStore } from "pinia";

export type PARTICLES_SETTINGS = "disabled" | "low" | "medium" | "high";

export const useSettingsStore = defineStore("settings", () => {
    const selectedTheme = ref<string>(localStorage.getItem("settings:theme") ?? "system");
    watch(selectedTheme, () => {
        localStorage.setItem("settings:theme", selectedTheme.value);
    });
    const selectedParticles = ref<PARTICLES_SETTINGS>(
        (localStorage.getItem("settings:particles") as PARTICLES_SETTINGS) ?? "medium",
    );
    watch(selectedParticles, () => {
        localStorage.setItem("settings:particles", selectedParticles.value);
    });

    const systemIsDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const systemPrefersReducedMotion = useMediaQuery("(prefers-reduced-motion)");

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

    const particles = computed(() =>
        systemPrefersReducedMotion ? "disabled" : selectedParticles.value,
    );

    return {
        theme,
        selectedTheme,

        particles,
        selectedParticles,
        systemPrefersReducedMotion,
    };
});
