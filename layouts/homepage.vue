<template>
    <div class="layout">
        <NavBar>
            <img src="~/assets/logo.webp" alt="Randomizer logo" />
            <span class="app-name">Stardew Perfection Randomizer</span>
        </NavBar>
        <main class="content">
            <slot />
        </main>
    </div>
</template>

<style scoped lang="scss">
.content {
    margin-left: auto;
    margin-right: auto;
    padding: 0.5rem;

    max-width: 750px;
}
</style>
