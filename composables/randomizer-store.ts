import { defineStore } from "pinia";

const xpThresholds = [0, 100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000, 9999999];

export const useRandomizerStore = defineStore("randomizer", () => {
    const profile = localStorage.getItem("currentProfile");
    if (!profile) {
        throw new Error("No profile selected");
    }

    // TODO: load from save
    const serializedProfileData = localStorage.getItem(`profile:${profile}`);
    if (!serializedProfileData) {
        throw new Error("Invalid save data");
    }
    const data = deserializeSaveData(serializedProfileData);

    // Tied to the currently loaded save file.
    const currentTemplateName = ref(data.templateName);
    const currentGoalID = ref<string | null>(data.currentGoalID);
    const predictedSkillXP = ref<Record<string, number>>(data.predictedSkillXP);

    const templateData = computed<Template>(() => getTemplate(currentTemplateName.value)!);
    if (!templateData.value) {
        throw new Error(`Could not find template ${currentTemplateName.value}`);
    }

    // This is also tied to the current state of the save file.
    const completion = ref(data.completion);

    // we're not adding the completion in here for performance
    const goals = computed(() =>
        Object.fromEntries(templateData.value!.goals.map((goal) => [goal.id, goal as Goal])),
    );

    const currentGoal = computed(() => {
        // @ts-ignore: TS is ignoring my optional chaining here for some reason
        return (goals.value?.[currentGoalID.value] ?? null) as Goal | null;
    });

    const completedCount = computed(() =>
        Object.values(completion.value).reduce((sum, current) => sum + current, 0),
    );

    const totalCount = computed(() =>
        templateData.value.goals.reduce((sum, goal) => sum + goal.multiplicity, 0),
    );

    watch(
        [currentGoalID, predictedSkillXP, completion],
        async () => {
            // This is just a rough test for now.
            // some rough tests show that regular save gen is really fast (like, a millisecond)
            // saves will be ~150 kB max, so if we allow up to 5 profiles, we're still good
            console.time("save");

            const saveData = serializeSaveData({
                currentGoalID: currentGoalID.value,
                templateName: currentTemplateName.value,
                predictedSkillXP: predictedSkillXP.value,
                completion: completion.value,
            });
            localStorage.setItem(`profile:${profile}`, saveData);

            console.timeEnd("save");
        },
        // I'm not sure why this is required.
        { deep: true },
    );

    function isPrerequisiteMet(prerequisite: Prerequisite) {
        const requiredCompletion = prerequisite.multiplicity ?? 1;

        if (prerequisite.goal.startsWith("#")) {
            // this is a tag
            const tagName = prerequisite.goal.slice(1);
            const tagGoals = templateData.value.tags[tagName];
            return tagGoals.some((tagGoal) => completion.value[tagGoal] >= requiredCompletion);
        } else {
            return completion.value[prerequisite.goal] >= requiredCompletion;
        }
    }

    // This is extracted into an action because setting goals via the Goals tab
    // can also change level up goal completions
    // (I could also watch on level goals, but there's no easy way to detect them)
    function updatePredictedXPLevelUp(skill: string) {
        const goalID = `level:${skill}`;

        // we're not substituting the XP threshold here because we're about to set it
        const previousXP = predictedSkillXP.value[skill] ?? 0;
        const newXP = Math.max(previousXP, xpThresholds[completion.value[goalID]]);
        predictedSkillXP.value[skill] = newXP;
    }

    function rollGoal() {
        const eligibleGoals = Object.values(goals.value)
            .filter((goal) => {
                // do not roll the current goal
                if (goal.id == currentGoalID.value) return false;
                // do not roll completed goals
                if (completion.value[goal.id] >= goal.multiplicity) return false;

                // check for prerequisites
                const reqs = goal.prerequisites;
                if (reqs.all) {
                    if (!reqs.all.every((prerequisite) => isPrerequisiteMet(prerequisite)))
                        return false;
                } else if (reqs.any) {
                    if (!reqs.any.some((prerequisite) => isPrerequisiteMet(prerequisite)))
                        return false;
                }

                // check for XP values
                for (const [skill, impliedXP] of Object.entries(goal.xp)) {
                    const level = completion.value[skill];
                    // if there is no saved XP prediction, use the current level as a baseline
                    let currentXP = predictedSkillXP.value[skill] ?? xpThresholds[level];
                    currentXP += impliedXP;
                    if (currentXP >= xpThresholds[level + 1]) {
                        return false;
                    }
                }

                return true;
            })
            // weigh goals by their remaining multiplicity
            .flatMap((goal) => new Array(goal.multiplicity - completion.value[goal.id]).fill(goal));
        const index = Math.floor(Math.random() * eligibleGoals.length);
        currentGoalID.value = eligibleGoals[index].id;
    }

    function cancelGoal() {
        currentGoalID.value = null;
    }

    function finishGoal() {
        if (currentGoal.value == null) return;

        if (completion.value[currentGoal.value.id] < currentGoal.value.multiplicity) {
            completion.value[currentGoal.value.id] += 1;
        }

        // update XP prediction for level goal
        let matches = currentGoal.value.id.match(/^level:(.+)$/);
        if (matches) {
            const skill = matches[1];
            updatePredictedXPLevelUp(skill);
        }

        // add implied XP to the prediction
        for (const [skill, impliedXP] of Object.entries(currentGoal.value.xp)) {
            let currentXP = predictedSkillXP.value[skill] ?? xpThresholds[completion.value[skill]];
            currentXP += impliedXP;
            predictedSkillXP.value[skill] = currentXP;
        }

        cancelGoal();
    }

    return {
        // state & getters
        currentTemplateName,
        currentGoalID,
        templateData,
        predictedSkillXP,
        completion,
        goals,
        currentGoal,
        completedCount,
        totalCount,
        // actions
        updatePredictedXPLevelUp,
        rollGoal,
        cancelGoal,
        finishGoal,
    };
});