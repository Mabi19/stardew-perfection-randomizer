<template>
    <div class="goal-list" v-if="filteredGoals && filteredGoals.length > 0">
        <div class="goal-list-header">
            <span class="goal-list-completion">Comp.</span>
            <span class="goal-list-name">Name</span>
            <span class="goal-list-action"><!-- more info button --></span>
        </div>
        <RecycleScroller
            class="goal-list-body"
            page-mode
            :buffer="300"
            :items="filteredGoals"
            :item-size="30"
            key-field="id"
            v-slot="{ item }"
        >
            <ListGoal :goal="item" @info-click="openGoalInfo"></ListGoal>
        </RecycleScroller>
    </div>
    <div v-else>No goals matching filter!</div>

    <AppDialog
        :open="infoGoal != null"
        :title="infoGoal?.name ?? '<unknown>'"
        @close="infoGoal = null"
    >
        <div class="goal-info-wrapper" v-if="infoGoal != null">
            <div>
                <strong>ID:</strong>
                <code>{{ infoGoal.id }}</code>
            </div>
            <div>
                <strong>Multiplicity:</strong>
                <span>{{ infoGoal.multiplicity }}</span>
            </div>
            <div>
                <strong>Image:</strong>
                <a v-if="infoGoal.imageURL" :href="infoGoal.imageURL">{{ infoGoal.imageURL }}</a>
                <span v-else>&lt;none&gt;</span>
            </div>
            <div>
                <strong>Prerequisites:</strong>
                <div class="prerequisites" v-if="Object.keys(infoGoal.prerequisites).length > 0">
                    <GoalListPrerequisites :prerequisites="infoGoal.prerequisites" />
                </div>
                <span v-else>&lt;none&gt;</span>
            </div>
            <div>
                <strong>Implied XP:</strong>
                <div class="implied-xp" v-if="!isEmpty(infoGoal.xp)">
                    <ul>
                        <li v-for="(amount, skill) in infoGoal.xp" class="capitalize">
                            {{ amount }} {{ skill }}
                        </li>
                    </ul>
                </div>
                <span v-else>&lt;none&gt;</span>
            </div>
            <div>
                <strong>Currently eligible:</strong>
                <span>{{ formatEligibilityStatus(infoGoal) }}</span>
            </div>
            <div class="button-box">
                <AppButton
                    icon="tune"
                    :disabled="
                        infoGoal.id == store.currentGoalID ||
                        (store.completion[infoGoal.id] ?? 0) >= infoGoal.multiplicity
                    "
                    @click="store.currentGoalID = infoGoal!.id"
                >
                    Set as current
                </AppButton>
            </div>
        </div>
    </AppDialog>
</template>

<script setup lang="ts">
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const props = defineProps<{
    searchTerm: string;
}>();

const store = useRandomizerStore();
await store.waitForReady();

const filteredGoals = computed(() => {
    const lowerSearchTerm = props.searchTerm.toLowerCase();

    if (lowerSearchTerm.length < 4) {
        return store.templateData?.goals;
    }

    return store.templateData?.goals?.filter((goal) =>
        goal.name.toLowerCase().includes(lowerSearchTerm),
    );
});

const selectedGoalQuery = useRoute().query.selected;
const selectedGoalID = selectedGoalQuery
    ? Array.isArray(selectedGoalQuery)
        ? selectedGoalQuery[0]!
        : selectedGoalQuery
    : undefined;
const selectedGoal = selectedGoalID ? store.goals?.[selectedGoalID] ?? null : null;

const infoGoal = ref<Goal | null>(selectedGoal);

function openGoalInfo(goal: Goal) {
    infoGoal.value = goal;
}

function isEmpty(o: {}) {
    return Object.keys(o).length == 0;
}

function formatEligibilityStatus(goal: Goal) {
    const names = {
        [GoalEligibilityStatus.ELIGIBLE]: "✅ Yes",
        [GoalEligibilityStatus.ALREADY_COMPLETED]: "❌ No (already completed)",
        [GoalEligibilityStatus.NO_PREREQUISITES]: "❌ No (prerequisites not completed)",
        [GoalEligibilityStatus.NOT_ENOUGH_XP_LEEWAY]: "❌ No (not enough XP leeway)",
    };

    return names[store.getEligibilityStatus(goal)];
}
</script>

<style scoped lang="scss">
.goal-list {
    max-width: 100%;

    .goal-list-header {
        display: flex;
        flex-flow: row nowrap;
        font-weight: bold;
        text-align: center;
    }

    :deep(.goal-list-completion) {
        width: 72px;
    }
    :deep(.goal-list-name) {
        max-width: 25rem;
        flex-grow: 1;
    }
    :deep(.goal-list-action) {
        width: 32px;
    }
}

.goal-info-wrapper {
    & > div {
        & > strong {
            margin-right: 0.5ch;
        }
    }
}

.button-box {
    margin-top: 1rem;
}

.prerequisites {
    margin-left: 1rem;
    :deep(ul) {
        margin: 0;
        padding-left: 2rem;
    }
}
.implied-xp {
    ul {
        margin: 0;
        padding-left: 2rem;
    }
}

.capitalize {
    text-transform: capitalize;
}
</style>
