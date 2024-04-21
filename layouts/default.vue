<template>
    <div class="layout">
        <NavBar>
            <img src="~/assets/logo.webp" alt="Randomizer logo" />
            <span class="app-name">Stardew Perfection Randomizer</span>
            <span class="badge green small-hide">RC</span>
            <div class="divider"></div>
            <NuxtLink to="/dashboard"
                ><span class="material-icons">flag</span><span>Dashboard</span></NuxtLink
            >
            <NuxtLink to="/goals"
                ><span class="material-icons">list</span><span>Goals</span></NuxtLink
            >
            <div class="fill"></div>
            <div class="divider"></div>
            <NuxtLink to="/settings"
                ><span class="material-icons">settings</span
                ><span class="small-hide">Settings</span></NuxtLink
            >
        </NavBar>
        <main class="content">
            <slot />
        </main>
    </div>
</template>

<style scoped lang="scss">
@use "~/assets/base";

@media (max-width: 750px) {
    .app-name,
    .small-hide {
        display: none;
    }

    .divider {
        margin: 0 0.2rem;
    }
}

.content {
    flex-grow: 1;
    overflow-y: auto;
}
</style>
