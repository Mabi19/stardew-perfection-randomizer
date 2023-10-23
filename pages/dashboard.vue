<template>
    <div class="dashboard" :class="{ complete: isFinished }">
        <div class="main">
            <div class="goal-area">
                <template v-if="!isFinished">
                    <div class="current-goal-title">Current Goal:</div>
                    <Goal
                        class="main-goal"
                        v-if="store.currentGoal"
                        :goal="store.currentGoal"
                        :show-repeat-number="true"
                    />
                    <Goal class="main-goal" v-else :goal="nullGoal" />

                    <div class="controls">
                        <AppButton v-if="store.currentGoalID" icon="done" @click="finishGoal">
                            Finish Goal
                        </AppButton>
                        <AppButton v-else icon="casino" @click="rollGoal">
                            Generate Goal
                        </AppButton>
                        <!-- to prevent layout shift, change the visibility -->
                        <AppButton
                            icon="block"
                            type="destructive"
                            @click="cancelGoal"
                            :style="{
                                visibility: store.currentGoalID ? 'visible' : 'hidden',
                            }"
                        >
                            Cancel Goal
                        </AppButton>
                    </div>
                </template>
                <div class="main-goal" v-else>All goals completed! 🎉</div>
            </div>
        </div>
        <div class="completion">
            <div class="label">
                Completed Goals: {{ store.completedCount }}/{{ store.totalCount }} ({{
                    numberFormatter.format((100 * store.completedCount) / store.totalCount)
                }}%)
            </div>
            <ChallengeProgressBar :fill="store.completedCount / store.totalCount" />
        </div>
    </div>
</template>

<script setup lang="ts">
import NullGoalIcon from "~/assets/null-goal-icon.png";

useHead({
    title: "Dashboard",
});

const store = useRandomizerStore();

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

const isFinished = computed(() => store.completedCount == store.totalCount);

const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
});
</script>

<style scoped lang="scss">
@use "~/assets/base";

.dashboard {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;

    background: url("~/assets/background-light.png");
    image-rendering: crisp-edges;
    background-position: 50% 50%;
    background-size: cover;

    font-size: 1.25rem;

    position: relative;
}

.dashboard::after {
    content: "";

    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

    background: url("~/assets/background-complete.png");

    image-rendering: crisp-edges;
    background-position: 50% 50%;
    background-size: cover;

    opacity: 0;
    transition: opacity 1s ease-out;

    z-index: 1;
}

.dashboard.complete::after {
    opacity: 1;
}

.main {
    flex-grow: 1;

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;

    padding: 0.5rem;

    z-index: 2;
}

.goal-area {
    background-color: rgb(214, 247, 214);
    border: 2px solid #599159;
    border-radius: 1rem;
    padding: 1rem;
}

.current-goal-title {
    text-align: center;
}

.main-goal {
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
}

.controls {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 1rem;

    margin-top: 1.5rem;
}

.completion {
    z-index: 2;
}

.completion .label {
    color: whitesmoke;
    background-color: rgba(10, 10, 10, 0.85);
    padding: 0.5rem;
    border-radius: 0.5rem;

    width: fit-content;
    margin-inline: auto;
    margin-bottom: 0.5rem;
}
</style>
