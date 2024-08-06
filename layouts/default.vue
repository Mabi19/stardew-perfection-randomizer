<template>
    <div class="layout">
        <NavBar>
            <img class="app-logo" src="~/assets/logo.webp" alt="Randomizer logo" />
            <span class="app-name small-hide">Stardew Perfection Randomizer</span>
            <div class="divider tiny-hide"></div>
            <NuxtLink to="/dashboard"
                ><span class="material-icons">flag</span
                ><span class="tab-name">Dashboard</span></NuxtLink
            >
            <NuxtLink to="/goals"
                ><span class="material-icons">checklist</span
                ><span class="tab-name">Goals</span></NuxtLink
            >
            <NuxtLink to="/log"
                ><span class="material-icons">receipt_long</span
                ><span class="tab-name">Log</span></NuxtLink
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

.content {
    flex-grow: 1;
    overflow-y: auto;
}
</style>
