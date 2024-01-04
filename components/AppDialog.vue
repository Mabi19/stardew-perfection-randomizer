<template>
    <Teleport to="body">
        <Transition>
            <div class="darkenator" v-if="open" @click="closeDialog">
                <div class="dialog" @click.stop>
                    <div class="title">
                        <span>{{ title }}</span>
                        <button class="material-icons" @click="closeDialog">close</button>
                    </div>
                    <div class="content">
                        <slot />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
const _props = defineProps<{
    title: string;
    open: boolean;
}>();

const emit = defineEmits<{
    (event: "close"): boolean;
}>();

function closeDialog() {
    emit("close");
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

.darkenator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);

    display: grid;
    place-items: center;

    z-index: 100;
}

.dialog {
    display: flex;
    flex-flow: column nowrap;
    border-radius: 0.75rem;
    overflow: hidden;

    min-width: 300px;
    max-width: min(750px, calc(100vw - 1rem));

    & > * {
        padding: 1rem;
    }
}

.title {
    background-color: base.$accent;
    color: whitesmoke;

    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;

    button {
        border: none;
        background: none;
        color: inherit;
        padding: 0;
        margin: 0;

        cursor: pointer;

        &:hover {
            opacity: 0.8;
        }
    }
}

.content {
    background: whitesmoke;
}

.dark-theme .content {
    background-color: var(--background);
}

.v-enter-active {
    animation: fade 0.3s ease-out;

    .dialog {
        animation: grow 0.3s ease-out;
    }
}

.v-leave-active {
    animation: fade reverse 0.3s ease-out;

    .dialog {
        animation: grow reverse 0.3s ease-out;
    }
}

@keyframes fade {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes grow {
    0% {
        transform: scale(0);
    }

    100% {
        transform: scale(1);
    }
}
</style>
