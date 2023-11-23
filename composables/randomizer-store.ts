import { defineStore } from "pinia";

export const useRandomizerStore = defineStore("randomizer", () => {
    const profiles = useProfilesStore();

    if (!profiles.current) {
        throw new Error("No profile selected");
    }

    const serializedProfileData = localStorage.getItem(`profile:${profiles.current}`);
    if (!serializedProfileData) {
        throw new Error("Invalid save data");
    }
    const data = deserializeSaveData(serializedProfileData);

    // Tied to the currently loaded save file.
    const currentTemplateName = ref(data.templateName);
    const currentGoalID = ref(data.currentGoalID);
    const predictedSkillXP = ref(data.predictedSkillXP);

    watch(
        () => profiles.current,
        () => {
            // This is a bit hacky, but I don't really have a good way to do this
            // (Computed getters don't work here because I need to set them)
            if (!profiles.current) {
                throw new Error("No profile selected");
            }

            const serializedProfileData = localStorage.getItem(`profile:${profiles.current}`);
            if (!serializedProfileData) {
                throw new Error("Invalid save data");
            }
            const data = deserializeSaveData(serializedProfileData);

            currentTemplateName.value = data.templateName;
            currentGoalID.value = data.currentGoalID;
            predictedSkillXP.value = data.predictedSkillXP;
            completion.value = data.completion;
        },
    );

    const templateData = computed<Template>(() => {
        if (currentTemplateName.value == "custom") {
            const serializedTemplate = localStorage.getItem(`profileTemplate:${profiles.current}`);
            return JSON.parse(serializedTemplate ?? "null");
        }

        return getPredefinedTemplate(currentTemplateName.value)!;
    });
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
        // @ts-ignore: TS is ignoring my nullish coalescing here for some reason
        return (goals.value[currentGoalID.value] ?? null) as Goal | null;
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
            // some rough tests show that regular save gen is really fast (like, a millisecond)
            // saves will be ~150 kB max, so if we allow up to 5 profiles, we're still good
            console.time("save");

            const saveData = serializeSaveData({
                currentGoalID: currentGoalID.value,
                templateName: currentTemplateName.value,
                predictedSkillXP: predictedSkillXP.value,
                completion: completion.value,
            });
            localStorage.setItem(`profile:${profiles.current}`, saveData);

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
        const newXP = Math.max(previousXP, skillXPValues[completion.value[goalID]]);
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
                    let currentXP = predictedSkillXP.value[skill] ?? skillXPValues[level];
                    currentXP += impliedXP;
                    if (currentXP >= skillXPValues[level + 1]) {
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
            let currentXP = predictedSkillXP.value[skill] ?? skillXPValues[completion.value[skill]];
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
