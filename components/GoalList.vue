<template>
    <table class="goal-list" v-if="filteredGoals.length > 0">
        <thead>
            <tr>
                <th>Comp.</th>
                <th>Name</th>
                <th><!-- settings button --></th>
            </tr>
        </thead>
        <tbody>
            <ListGoal
                v-for="goal in filteredGoals"
                :goal="goal"
                @info-click="openGoalInfo"
            ></ListGoal>
        </tbody>
    </table>
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
                <div class="prerequisites" v-if="infoGoalReqs">
                    <span>
                        {{ infoGoal.prerequisites.all ? "All" : "Any" }} of these goals must be met:
                    </span>
                    <ul>
                        <li v-for="req in infoGoalReqs">
                            <Goal
                                v-if="store.goals[req.goal]"
                                :goal="store.goals[req.goal]"
                                class="inline"
                            />
                            <!-- this is required for tags to work -->
                            <code v-else>{{ req.goal }}</code>
                            <span
                                v-if="req.multiplicity && req.multiplicity > 1"
                                class="inline-goal-mult"
                            >
                                (x{{ req.multiplicity }})
                            </span>
                        </li>
                    </ul>
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
                <span>{{ store.isEligible(infoGoal) ? "✅ Yes" : "❌ No" }}</span>
            </div>
            <div class="button-box">
                <AppButton
                    icon="tune"
                    :disabled="
                        infoGoal.id == store.currentGoalID ||
                        store.completion[infoGoal.id] >= infoGoal.multiplicity
                    "
                    @click="store.currentGoalID = infoGoal.id"
                >
                    Set as current
                </AppButton>
            </div>
        </div>
    </AppDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
    searchTerm: string;
}>();

const store = useRandomizerStore();

const filteredGoals = computed(() => {
    const lowerSearchTerm = props.searchTerm.toLowerCase();

    if (lowerSearchTerm.length < 4) {
        return store.templateData.goals;
    }

    return store.templateData.goals.filter((goal) =>
        goal.name.toLowerCase().includes(lowerSearchTerm),
    );
});

const infoGoal = ref<Goal | null>(null);
const infoGoalReqs = computed(() => {
    if (infoGoal.value == null) return null;
    return infoGoal.value.prerequisites.all ?? infoGoal.value.prerequisites.any ?? null;
});

function openGoalInfo(goal: Goal) {
    infoGoal.value = goal;
}

function isEmpty(o: {}) {
    return Object.keys(o).length == 0;
}
</script>

<style scoped lang="scss">
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

.prerequisites,
.implied-xp {
    ul {
        margin: 0;
        padding-left: 2rem;
    }
}

.inline {
    display: inline;
}

.capitalize {
    text-transform: capitalize;
}

.inline-goal-mult {
    vertical-align: middle;
}
</style>
