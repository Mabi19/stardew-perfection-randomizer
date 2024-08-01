<template>
    <div class="status goal-list-completion">
        <template v-if="store.currentGoalID != goal.id">
            <input
                v-if="goal.multiplicity == 1"
                type="checkbox"
                :checked="Boolean(store.completion[goal.id])"
                :id="`goal:${goal.id}`"
                @change="handleCheckbox"
            />
            <span class="badge status-value" v-else>
                <input
                    class="completion-input"
                    type="number"
                    min="0"
                    :max="goal.multiplicity"
                    :value="store.completion[goal.id]"
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
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal;
}>();

// For performance, the completion is not injected into the goals data, but stored separately
// so, we need to get it manually
const store = useRandomizerStore();
const profiles = useProfilesStore();
const logStore = useLogStore();

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
</script>

<style scoped lang="scss">
@use "~/assets/base";

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
</style>
