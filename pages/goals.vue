<template>
    <div class="part">
        <AppButton icon="edit" @click="templateUpdateActive = true"
            >Edit goal definitions</AppButton
        >
    </div>
    <div class="part" v-if="store.templateData?.ruleset">
        This Randomizer uses {{ store.templateData.ruleset }} rules.
        <a href="https://bit.ly/RandomPerfection">Perfection Randomizer Rules Document</a>
    </div>
    <div class="part" v-if="hasLevelUpGoals">
        Completing some goals requires obtaining Skill XP. To not assign goals that are impossible
        without leveling up, the Randomizer tracks an estimate of your current XP:
        <strong v-if="xpEntries.length == 0">none right now!</strong>
        <ul v-for="entry in xpEntries" class="xp-list">
            <li>
                {{ entry.name }} - {{ entry.totalXP }} XP (level {{ entry.level
                }}<template v-if="entry.remaining"
                    >, {{ entry.remaining }} XP to next level</template
                >)
            </li>
        </ul>
        If these values are inaccurate and you've got access to your save file, you can update them
        by providing your data directly.
        <AppButton icon="update" @click="xpPredictionDialogActive = true"
            >Update XP predictions</AppButton
        >
    </div>
    <div class="part row">
        <label for="filter">Filter goals:</label>
        <input id="filter" type="search" v-model="searchTerm" ref="searchBox" />
    </div>
    <div class="part">
        <GoalList :search-term="searchTerm"></GoalList>
    </div>

    <XPUpdateDialog :open="xpPredictionDialogActive" @finish="xpPredictionDialogActive = false" />
    <TemplateUpdateDialog :open="templateUpdateActive" @finish="templateUpdateActive = false" />
</template>

<script setup lang="ts">
useHead({
    title: "Goals",
});

const store = useRandomizerStore();
await store.waitForReady();

const searchTerm = ref("");
const searchBox = ref<HTMLInputElement | null>(null);

useKeyboardShortcut(KEY_MODIFIERS.CTRL, "F", () => searchBox.value?.focus());

const hasLevelUpGoals = computed(() =>
    store.templateData?.goals.some((goal) => goal.id.startsWith("level:")),
);

const xpPredictionDialogActive = ref(false);

function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}

const xpEntries = computed(() =>
    Object.entries(store.predictedSkillXP).map(([skill, xp]) => {
        const levelInfo = skillXPToLevel(xp);
        return {
            name: toTitleCase(skill),
            totalXP: xp,
            ...levelInfo,
        };
    }),
);

const templateUpdateActive = ref(false);
</script>

<style scoped lang="scss">
.part {
    margin: 1rem;
}

.xp-list {
    margin: 0.25rem 0;
}
</style>
