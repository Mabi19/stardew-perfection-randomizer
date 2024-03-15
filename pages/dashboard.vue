<template>
    <div ref="dashboardElem" class="dashboard" :class="{ complete: isFinished }">
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
        <GoalNotificationArea
            ref="notificationArea"
            :undo-count="historyContext.undoStack.length"
            :redo-count="historyContext.redoStack.length"
            @undo-button="undo"
            @redo-button="redo"
        />
        <AppButton class="help-button" icon="info" @click="helpDialog = true">Stuck?</AppButton>
        <AppDialog title="Help" :open="helpDialog" @close="helpDialog = false">
            <p>
                The Randomizer attempts to select goals that will always be completable. However,
                this may require usage of obscure game mechanics or exploits, like fishing for Void
                Mayonnaise or chair glitching.
            </p>
            <p>
                If you're stuck, you can try looking at the tips-and-tricks document (coming
                soon&trade;) or asking for help in
                <a href="https://discord.gg/nxqNcCaJ93">ArgonMatrix's Discord server</a>.
            </p>
            <p>
                Note that the Randomizer isn't perfect, and may rarely give impossible goals. If
                you're sure that you're unable to progress, or just want to reroll, use the "Cancel
                Goal" button and generate again.
            </p>
        </AppDialog>

        <canvas ref="effectsCanvasElem" class="effects-overlay" role="presentation"></canvas>
    </div>
</template>

<script setup lang="ts">
import NullGoalIcon from "~/assets/null-goal-icon.png";
import { GoalNotificationArea } from "#components";
import { DashboardEffectContext } from "#imports";

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

const isFinished = computed(() => store.completedCount == store.totalCount);

const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
});

const notificationArea = ref<InstanceType<typeof GoalNotificationArea> | null>(null);
const historyContext = new HistoryContext(store);

// Try to prevent accidental double-clicks by adding a short cooldown to the buttons
const isOnCooldown = ref(false);
function setCooldown() {
    isOnCooldown.value = true;
    setTimeout(() => (isOnCooldown.value = false), 500);
}

function rollGoal() {
    if (isOnCooldown.value) {
        return;
    }

    const previousGoalID = store.currentGoalID;

    store.rollGoal();
    // this needs extra context in the form of the previous goal
    historyContext.hookGenerate(previousGoalID);

    setCooldown();

    notificationArea.value?.send("Generated", store.goals[store.currentGoalID!]);
}

function finishGoal() {
    if (isOnCooldown.value) {
        return;
    }

    historyContext.hookFinish();
    effectContext.value?.finishGoalHook();

    const goalID = store.currentGoalID!;

    store.finishGoal();
    setCooldown();

    notificationArea.value?.send("Finished", store.goals[goalID]);
}

function cancelGoal() {
    if (isOnCooldown.value) {
        return;
    }

    historyContext.hookCancel();

    const goalID = store.currentGoalID!;

    store.cancelGoal();
    setCooldown();

    notificationArea.value?.send("Canceled", store.goals[goalID]);
}

function undo() {
    historyContext.undo();
}

function redo() {
    const effect = historyContext.redo();

    if (effect) {
        // something was redone, generate a notification
        notificationArea.value?.send(`(Redo) ${effect.type}`, store.goals[effect.goalID]);
    }
}

useKeyboardShortcut(KEY_MODIFIERS.CTRL, "Z", () => notificationArea.value?.handleUndoAction());
useKeyboardShortcut(KEY_MODIFIERS.CTRL, "Y", () => notificationArea.value?.handleRedoAction());

// effects
const dashboardElem = ref<HTMLDivElement | null>(null);
const effectsCanvasElem = ref<HTMLCanvasElement | null>(null);

const effectContext = shallowRef<DashboardEffectContext | null>(null);

onMounted(() => {
    if (!dashboardElem.value || !effectsCanvasElem.value) {
        console.error("Could not get effect elements");
        return;
    }

    effectContext.value = new DashboardEffectContext(
        effectsCanvasElem.value,
        dashboardElem.value,
        useSettingsStore(),
    );

    watch(
        [() => store.completedCount, () => store.totalCount],
        () => {
            effectContext.value?.updateFinishPercent(store.completedCount / store.totalCount);

            // completion confetti
            if (store.completedCount == store.totalCount) {
                effectContext.value?.completeHook();
            }
        },
        { immediate: true },
    );
});

// overlay
const channel = new BroadcastChannel("sdvpr:stream_overlay");
watch(
    () => store.currentGoal,
    () => {
        channel.postMessage(store.currentGoal ?? nullGoal);
    },
    { immediate: true },
);

// help dialog
const helpDialog = ref(false);
</script>

<style scoped lang="scss">
@use "~/assets/base";

.dashboard {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;

    background: url("~/assets/background-light.png");
    image-rendering: pixelated;
    background-position: 50% 50%;
    background-size: cover;

    font-size: 1.25rem;

    position: relative;
}

@media screen and (min-width: 1500px) {
    .dashboard {
        font-size: 1.75rem;
    }
}

.dashboard::after {
    content: "";

    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

    background: url("~/assets/background-complete.png");

    image-rendering: pixelated;
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

.completion {
    z-index: 2;
}

.completion .label {
    color: whitesmoke;
    background-color: rgba(10, 10, 10, 0.85);
    padding: 0.25em;
    border-radius: 0.25em;

    width: fit-content;
    margin-inline: auto;
    margin-bottom: 0.5em;
}

.goal-area {
    background-color: rgb(214, 247, 214);
    border: 2px solid #599159;
    border-radius: 0.75em;
    padding: 0.75em;
}

.current-goal-title {
    text-align: center;
}

.main-goal {
    font-size: 2.5em;
    font-weight: bold;
    text-align: center;
}

.controls {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 0.75em;

    margin-top: 1.25em;
}

.help-button {
    position: absolute;
    top: 0.5em;
    left: 0.5em;
    z-index: 2;
}

.effects-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;

    pointer-events: none;
}

.dark-theme {
    .goal-area {
        background-color: rgb(43, 49, 43);
    }

    .dashboard {
        background-image: url("~/assets/background-dark.png");
    }
}
</style>
