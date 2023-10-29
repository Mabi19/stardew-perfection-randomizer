<template>
    <nav class="nav-bar">
        <slot />
    </nav>
</template>

<!-- Not scoped because we want to style stuff inside the navbar -->
<style lang="scss">
@use "~/assets/base";

.nav-bar {
    background-color: base.$accent;
    color: whitesmoke;
    padding: 0 0.5rem;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 4px;

    * {
        padding: 0.4rem 0.2rem;
    }

    // duplicate the class name to raise specificity
    // (in dark mode, links are .dark-mode a:link/:visited)
    &.nav-bar a {
        color: whitesmoke;
        text-decoration: none;
        height: 100%;

        display: flex;
        flex-flow: row nowrap;
        align-items: center;

        &:hover,
        &.router-link-active {
            background-color: base.$accent-light;
        }

        .material-icons {
            margin-right: 0.2rem;
        }
    }

    img {
        box-sizing: content-box;
        height: 2.5rem;
    }
}

.fill {
    flex-grow: 1;
}

.divider {
    height: 2rem;
    border-right: 1px solid #a48cb9;
    padding: 0;
    margin: 0 0.5rem;
}
</style>
