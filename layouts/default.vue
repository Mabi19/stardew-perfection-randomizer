<template>
    <div class="layout">
        <div class="top-bar">
            <span>[logo] Stardew Perfection Randomizer</span>
            <NuxtLink to="/dashboard">Dashboard</NuxtLink>
            <NuxtLink to="/goals">Goals</NuxtLink>
        </div>
        <div class="content">
            <slot/>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "~/assets/base";
.layout {
    width: 100%;
    height: 100vh;
    overflow: hidden;

    display: flex;
    flex-flow: column nowrap;
}

.top-bar {
    background-color: base.$accent;
    color: whitesmoke;
    padding: 1rem;

    display: flex;
    flex-flow: row nowrap;
    gap: 8px;

    a {
        color: whitesmoke;
    }
}

.content {
    flex-grow: 1;
    overflow-y: auto;
}
</style>