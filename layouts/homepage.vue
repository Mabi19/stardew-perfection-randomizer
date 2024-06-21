<template>
    <div class="layout">
        <NavBar>
            <img src="~/assets/logo.webp" alt="Randomizer logo" />
            <span class="app-name">Stardew Perfection Randomizer</span>
        </NavBar>
        <div class="content-scroller">
            <main class="content">
                <slot />
            </main>
        </div>
    </div>
</template>

<style scoped lang="scss">
.content {
    margin-left: auto;
    margin-right: auto;
    padding: 0.5rem;

    max-width: 750px;
}

.content-scroller {
    overflow-y: auto;
}
</style>
