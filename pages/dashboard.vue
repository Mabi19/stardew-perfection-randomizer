<template>
    <div class="dashboard">
        <div class="main">
            <div>Current Goal:</div>
            <Goal
                class="cur-goal-name"
                v-if="store.currentGoal"
                :goal="store.currentGoal"
                :show-repeat-number="true"
            />
            <Goal class="cur-goal-name" v-else :goal="nullGoal" />
            <div class="controls">
                <template v-if="store.currentGoalID">
                    <AppButton icon="done" @click="finishGoal">
                        Finish Goal
                    </AppButton>
                    <AppButton
                        icon="block"
                        type="destructive"
                        @click="cancelGoal"
                    >
                        Cancel Goal
                    </AppButton>
                </template>
                <template v-else>
                    <AppButton icon="casino" @click="rollGoal">
                        Generate Goal
                    </AppButton>
                </template>
            </div>
        </div>
        <div class="completion">
            <div class="progress-bar" :style="progressFill"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import NullGoalIcon from "~/assets/null-goal-icon.png";

const store = useAppStore();

const nullGoal: Goal = {
    id: "null_placeholder",
    name: "No Goal Active!",
    imageURL: NullGoalIcon,
    prerequisites: {},
    xp: {},
    multiplicity: 0,
};

function rollGoal() {
    store.rollGoal();
}

function finishGoal() {
    store.finishGoal();
}

function cancelGoal() {
    // TODO: check for confirmation
    store.cancelGoal();
}

const progressFill = computed(() => ({
    "--fill": `${(100 * store.completedCount) / store.totalCount}%`,
}));
</script>

<style scoped lang="scss">
@use "~/assets/base";

.dashboard {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;
}

.main {
    flex-grow: 1;

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    font-size: 1.25rem;
}

.cur-goal-name {
    font-size: 3rem;
    font-weight: bold;
}

.controls {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 1rem;
}

.progress-bar {
    width: 100%;
    transform: translateX(calc(-100% + var(--fill)));
    transition:
        transform 1s ease-out,
        border-top-right-radius 1s ease-out,
        background 1s ease-out;

    height: 0.5rem;
    border-top-right-radius: 0.5rem;

    background: base.$accent;

    // this is needed for the full bar gradient to be contained within
    // (it is absolute-positioned, so we need a new stacking context)
    contain: layout;
}

.progress-bar::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0.5rem;

    opacity: 0;
    transition: opacity 1s ease-out;

    background: linear-gradient(
        to right,
        hsl(0deg, 100%, 70%),
        hsl(10deg, 100%, 70%),
        hsl(20deg, 100%, 70%),
        hsl(30deg, 100%, 70%),
        hsl(40deg, 100%, 70%),
        hsl(50deg, 100%, 70%),
        hsl(60deg, 100%, 70%),
        hsl(70deg, 100%, 70%),
        hsl(80deg, 100%, 70%),
        hsl(90deg, 100%, 70%),
        hsl(100deg, 100%, 70%),
        hsl(110deg, 100%, 70%),
        hsl(120deg, 100%, 70%),
        hsl(130deg, 100%, 70%),
        hsl(140deg, 100%, 70%),
        hsl(150deg, 100%, 70%),
        hsl(160deg, 100%, 70%),
        hsl(170deg, 100%, 70%),
        hsl(180deg, 100%, 70%),
        hsl(190deg, 100%, 70%),
        hsl(200deg, 100%, 70%),
        hsl(210deg, 100%, 70%),
        hsl(220deg, 100%, 70%),
        hsl(230deg, 100%, 70%),
        hsl(240deg, 100%, 70%),
        hsl(250deg, 100%, 70%),
        hsl(260deg, 100%, 70%),
        hsl(270deg, 100%, 70%),
        hsl(280deg, 100%, 70%),
        hsl(290deg, 100%, 70%),
        hsl(300deg, 100%, 70%),
        hsl(310deg, 100%, 70%),
        hsl(320deg, 100%, 70%),
        hsl(330deg, 100%, 70%),
        hsl(340deg, 100%, 70%),
        hsl(350deg, 100%, 70%),
        hsl(360deg, 100%, 70%)
    );
}

.progress-bar.full {
    transform: none;
    border-top-right-radius: 0;
}

.progress-bar.full::after {
    opacity: 1;
}
</style>
