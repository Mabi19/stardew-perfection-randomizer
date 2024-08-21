<!-- NOTE: PlainIconButton is inlined into this for performance -->

<template>
    <div class="goal">
        <div class="status goal-list-completion">
            <template v-if="store.currentGoalID != goal.id">
                <input
                    v-if="goal.multiplicity == 1"
                    type="checkbox"
                    :checked="completion > 0"
                    :id="`goal:${goal.id}`"
                    @change="handleCheckbox"
                />
                <span class="badge status-value" v-else>
                    <input
                        class="completion-input"
                        type="number"
                        min="0"
                        :max="goal.multiplicity"
                        :value="completion"
                        :id="`goal:${goal.id}`"
                        @input="handleInput"
                    /><span>/{{ goal.multiplicity }}</span>
                </span>
            </template>
            <span
                class="badge status-value"
                title="Cancel or finish this goal to edit its completion."
                v-else
            >
                current
            </span>
        </div>
        <div class="goal-list-name">
            <label :for="`goal:${goal.id}`"><Goal :goal="goal" /></label>
        </div>
        <div class="info goal-list-action">
            <button class="plain-button material-icons" @click="openDialog">more_horiz</button>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal;
}>();

const emit = defineEmits<{
    infoClick: [goal: Goal];
}>();

// For performance, the completion is not injected into the goals data, but stored separately
// so, we need to get it manually
const store = useRandomizerStore();
const profiles = useProfilesStore();
const logStore = useLogStore();

const completion = computed(() => store.completion[props.goal.id] ?? 0);

function handleCheckbox(event: Event) {
    update(Number((event.target as HTMLInputElement).checked));
}

function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value == "") {
        return;
    }
    update(Number(value));
}

function update(state: number) {
    const numericValue = typeof state == "number" ? state : Number(state);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > props.goal.multiplicity) {
        return;
    }

    const oldState = store.completion[props.goal.id] ?? 0;
    store.completion[props.goal.id] = state;

    logStore.addEntry({
        profile: profiles.current!,
        timestamp: new Date(),
        type: state >= oldState ? "mark" : "unmark",
        goal: {
            id: props.goal.id,
            name: props.goal.name,
            multiplicity: props.goal.multiplicity,
            imageURL: props.goal.imageURL,
        },
    });

    // If this is a level up goal, update the XP values
    // This isn't great code (Ideally I'd be watching on setting level up completions),
    // but there isn't an easy way to do that
    const matches = props.goal.id.match(/^level:(.+)$/);
    if (matches) {
        store.updatePredictedXPLevelUp(matches[1]!);
    }
}

// we want the list items to be as light as possible, so defer opening the dialog box to the parent
function openDialog() {
    emit("infoClick", props.goal);
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

.info {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
}

.goal {
    // needs to be set in pixels for virtual scroller
    // 1em = 16px
    height: 30px;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    * {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}

.status {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
}

.status-value {
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: center;
}

.completion-input {
    border-radius: 4px;
    border: none;
    width: 2ch;
    padding: 0 0.1rem;
    box-sizing: content-box;
    text-align: right;
    font: inherit;

    background-color: base.$accent-light;
    color: white;

    appearance: textfield;
    &::-webkit-inner-spin-button {
        display: none;
    }
    &::-webkit-outer-spin-button {
        display: none;
    }
}

.plain-button {
    padding: 0;
    margin: 0;
    border: none;
    background: unset;
    cursor: pointer;
    font-size: 1.25rem;

    &:hover {
        opacity: 0.7;
    }

    &:disabled,
    &.disabled {
        color: var(--text-dim);
        cursor: not-allowed;
        opacity: 1;
    }
}
</style>
