const nonProfileRequiredPages = new Set(["/"]);

export default defineNuxtRouteMiddleware((to) => {
    const hasSaveFile = Boolean(localStorage.getItem("currentProfile"));
    if (nonProfileRequiredPages.has(to.path)) {
        if (hasSaveFile) {
            return navigateTo("/dashboard");
        }
    } else {
        if (!hasSaveFile) {
            return navigateTo("https://mabi.land/stardew-perfection-randomizer/", {
                external: true,
            });
        }
    }
});
