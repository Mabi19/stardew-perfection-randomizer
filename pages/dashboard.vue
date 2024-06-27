<template>
    <div
        ref="dashboardElem"
        id="dashboard"
        class="dashboard"
        :class="{ transitioning: nextBackground != null }"
        @transitionend="endBackgroundTransition"
    >
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
                    numberFormatter.format(100 * completionPercent)
                }}%)
            </div>
            <ChallengeProgressBar :fill="completionPercent" />
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
await store.waitForReady();
const settings = useSettingsStore();

const recentlyCancelledGoals = ref(new Set<string>());

const nullGoal: Goal = {
    id: "null_placeholder",
    name: "No Goal Active!",
    imageURL: NullGoalIcon,
    prerequisites: {},
    xp: {},
    multiplicity: 0,
};

const completionPercent = computed(() => store.completedCount / store.totalCount);
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

    store.rollGoal(recentlyCancelledGoals.value);

    // this needs extra context in the form of the previous goal
    historyContext.hookGenerate(previousGoalID);

    setCooldown();

    notificationArea.value?.send(
        "Generated",
        store.goals?.[store.currentGoalID!] ?? throwError(new Error("Current goal ID is invalid")),
    );
}

function finishGoal() {
    if (isOnCooldown.value) {
        return;
    }

    historyContext.hookFinish();
    effectContext.value?.finishGoalHook();

    const goalID = store.currentGoalID!;

    // goal was finished, so this chain of cancels no longer applies
    recentlyCancelledGoals.value.clear();

    store.finishGoal();
    setCooldown();

    notificationArea.value?.send(
        "Finished",
        store.goals?.[goalID] ?? throwError(new Error("Current goal ID is invalid")),
    );
}

function cancelGoal() {
    if (isOnCooldown.value) {
        return;
    }

    historyContext.hookCancel();

    const goalID = store.currentGoalID!;
    recentlyCancelledGoals.value.add(goalID);

    store.cancelGoal();
    setCooldown();

    notificationArea.value?.send(
        "Canceled",
        store.goals?.[goalID] ?? throwError(new Error("Current goal ID is invalid")),
    );
}

function undo() {
    historyContext.undo();
}

function redo() {
    const effect = historyContext.redo();

    if (effect) {
        // something was redone, generate a notification
        notificationArea.value?.send(
            `(Redo) ${effect.type}`,
            store.goals?.[effect.goalID] ?? throwError(new Error("History goal ID is invalid")),
        );
    }
}

useKeyboardShortcut(KEY_MODIFIERS.CTRL, "Z", () => notificationArea.value?.handleUndoAction());
useKeyboardShortcut(KEY_MODIFIERS.CTRL, "Y", () => notificationArea.value?.handleRedoAction());

// effects
const dashboardElem = ref<HTMLDivElement | null>(null);
const effectsCanvasElem = ref<HTMLCanvasElement | null>(null);

const effectContext = shallowRef<DashboardEffectContext | null>(null);

let secretModule: typeof import("~/utils/effects/secret-particles") | undefined = undefined;
let secretSpawnerInterval: ReturnType<typeof setInterval> | undefined = undefined;
import type { SpriteParticleSettings } from "~/utils/effects/SpriteParticle";
type SecretParticleID = keyof typeof import("~/utils/effects/secret-particles").SECRET_PARTICLES;
async function getSecretModule() {
    if (!secretModule) {
        secretModule = await import("~/utils/effects/secret-particles");
        // preload image
        secretModule.getBaseImage();
    }
    return secretModule;
}
async function spawnSecretParticle(id?: SecretParticleID) {
    const mod = await getSecretModule();

    const validKeys = Object.keys(mod.SECRET_PARTICLES);
    const filledID =
        id ?? (validKeys[Math.floor(Math.random() * validKeys.length)]! as SecretParticleID);

    const settings = mod.SECRET_PARTICLES[filledID]?.();
    if (!settings) {
        return;
    }

    effectContext?.value?.spawnParticle(
        new mod.SpriteParticle(settings as SpriteParticleSettings<{}>),
    );
}
onMounted(() => {
    (window as any)["imFeelingLucky"] = function () {
        // hide presence of the argument
        spawnSecretParticle(arguments[0]);
    };

    if ("luck" in store.predictedSkillXP && store.predictedSkillXP["luck"] > 0) {
        console.log("registering interval");
        // preload module
        getSecretModule();
        secretSpawnerInterval = setInterval(() => {
            if (Math.random() > 0.05) {
                return;
            }

            if (!document.hasFocus()) {
                return;
            }

            const REQUIREMENT_MAP: Partial<Record<SecretParticleID, string>> = {
                jet: "befriend_harvey",
                marilda: "befriend_maru",
                seaMonster: "befriend_krobus",
                gopher: "complete_fectors_challenge",
                qiPlane: "read_book_of_mysteries",
                luckyPurpleShorts: "befriend_lewis",
            };
            const particles = Object.keys(REQUIREMENT_MAP);
            const particle = particles[
                Math.floor(Math.random() * particles.length)
            ]! as SecretParticleID;
            const reqGoal = REQUIREMENT_MAP[particle];
            if (!reqGoal) {
                return;
            }
            if (store.completion[reqGoal] ?? 0 > 0) {
                spawnSecretParticle(particle);
            }
        }, 5000);
    }
});
onUnmounted(() => {
    delete (window as any)["imFeelingLucky"];
    if (secretSpawnerInterval) {
        clearInterval(secretSpawnerInterval);
    }
    effectContext.value?.clearEvents();
});

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
                cancelConstantConfetti();
                startConstantConfetti();
            } else {
                cancelConstantConfetti();
            }
        },
        { immediate: true },
    );
});

let animID = 0;
function startConstantConfetti() {
    if (effectContext.value && isFinished.value && document.hasFocus()) {
        effectContext.value.spawnConstantConfetti();
    }
    animID = requestAnimationFrame(() => startConstantConfetti());
}

function cancelConstantConfetti() {
    // Filled rAF IDs are always >0
    if (animID) {
        cancelAnimationFrame(animID);
        animID = 0;
    }
}

onUnmounted(() => {
    cancelConstantConfetti();
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

// backgrounds
import bgEggFestival from "~/assets/backgrounds/egg-festival.png";
import bgDesertFestival from "~/assets/backgrounds/desert-festival.png";
import bgFlowerDance from "~/assets/backgrounds/flower-dance.png";
import bgLuau from "~/assets/backgrounds/luau.png";
import bgTroutDerby from "~/assets/backgrounds/trout-derby.png";
import bgMoonlightJellies from "~/assets/backgrounds/moonlight-jellies.png";
import bgFair from "~/assets/backgrounds/fair.png";
import bgSpiritsEve from "~/assets/backgrounds/spirits-eve.png";
import bgFestivalOfIce from "~/assets/backgrounds/festival-of-ice.png";
import bgSquidFest from "~/assets/backgrounds/squidfest.png";
import bgNightMarket from "~/assets/backgrounds/night-market.png";
import bgWinterStar from "~/assets/backgrounds/winter-star.png";

import bgSummit from "~/assets/backgrounds/summit.png";

const backgroundSequences = {
    light: [bgEggFestival, bgFlowerDance, bgLuau, bgFair, bgFestivalOfIce, bgWinterStar, bgSummit],
    // prettier-ignore
    dark: [bgDesertFestival, bgTroutDerby, bgMoonlightJellies, bgSpiritsEve, bgSquidFest, bgNightMarket, bgSummit],
    // prettier-ignore
    light_1_5: [bgEggFestival, bgFlowerDance, bgLuau, bgFair, bgFestivalOfIce, bgWinterStar, bgSummit],
    dark_1_5: [bgMoonlightJellies, bgSpiritsEve, bgNightMarket, bgSummit],
};

const usedSequence = computed(() => {
    const theme = settings.theme;
    const isLegacyTemplate = ["standard", "hardcore"].includes(store.currentTemplateName);
    if (theme == "dark") {
        if (isLegacyTemplate) {
            return backgroundSequences.dark_1_5;
        } else {
            return backgroundSequences.dark;
        }
    } else {
        if (isLegacyTemplate) {
            return backgroundSequences.light_1_5;
        } else {
            return backgroundSequences.light;
        }
    }
});

const currentIndex = computed(() =>
    Math.floor(completionPercent.value * (usedSequence.value.length - 1)),
);

const currentBackground = ref(usedSequence.value[currentIndex.value]);
const nextBackground = ref<string | null>(null);

watch([currentIndex, usedSequence], () => {
    if (nextBackground.value == null) {
        nextBackground.value = usedSequence.value[currentIndex.value]!;
    } else {
        // failsafe: to not break future transitions, cancel everything
        currentBackground.value = usedSequence.value[currentIndex.value]!;
        nextBackground.value = null;
    }
});

// predictively cache the images that will be shown next
const nextPrevImageCache = {
    prev: null as HTMLImageElement | null,
    next: null as HTMLImageElement | null,
};
watch(
    [currentIndex, usedSequence],
    () => {
        if (currentIndex.value > 0) {
            nextPrevImageCache.prev = new Image();
            nextPrevImageCache.prev.src = usedSequence.value[currentIndex.value - 1]!;
        }

        if (currentIndex.value < usedSequence.value.length - 1) {
            nextPrevImageCache.next = new Image();
            nextPrevImageCache.next.src = usedSequence.value[currentIndex.value + 1]!;
        }
    },
    { immediate: true },
);

function endBackgroundTransition(ev: TransitionEvent) {
    // skip handling for any nested elements
    if (!(ev.target instanceof HTMLElement) || ev.target.id != "dashboard") {
        return;
    }
    currentBackground.value = nextBackground.value ?? usedSequence.value[currentIndex.value];
    nextBackground.value = null;
}

const currentBackgroundCSS = computed(() => `url("${currentBackground.value}")`);
const nextBackgroundCSS = computed(() =>
    nextBackground.value ? `url("${nextBackground.value}")` : undefined,
);
</script>

<style scoped lang="scss">
@use "~/assets/base";

.dashboard {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;

    background: v-bind(currentBackgroundCSS);
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

    background: v-bind(nextBackgroundCSS);

    image-rendering: pixelated;
    background-position: 50% 50%;
    background-size: cover;

    opacity: 0;
    transition: opacity 1s ease-out;

    z-index: 1;
}

.dashboard.transitioning::after {
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

    box-shadow: 5px 5px 3px 1px rgba(0, 0, 0, 0.4);
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
}
</style>
