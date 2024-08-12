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

    const templateData = shallowRef<Template | null>(null);
    watch(
        currentTemplateName,
        async () => {
            if (currentTemplateName.value == "custom") {
                const serializedTemplate = localStorage.getItem(
                    `profileTemplate:${profiles.current}`,
                );
                templateData.value = JSON.parse(serializedTemplate ?? "null");
            } else {
                try {
                    templateData.value = await getPredefinedTemplate(currentTemplateName.value);
                } catch (e) {
                    throw new Error(`Could not find template ${currentTemplateName.value}`);
                }
            }
        },
        { immediate: true },
    );

    // This is also tied to the current state of the save file.
    const completion = ref(data.completion);

    // we're not adding the completion in here for performance
    const goals = computed(() =>
        templateData.value
            ? Object.fromEntries(templateData.value.goals.map((goal) => [goal.id, goal as Goal]))
            : null,
    );

    const currentGoal = computed(() => {
        return currentGoalID.value ? goals.value?.[currentGoalID.value] ?? null : null;
    });

    const completedCount = computed(() =>
        Object.values(completion.value).reduce((sum, current) => sum + current, 0),
    );

    const totalCount = computed(() => {
        if (!templateData.value) {
            return 0;
        }

        return templateData.value.goals.reduce((sum, goal) => sum + goal.multiplicity, 0);
    });

    watch(
        [currentGoalID, predictedSkillXP, completion],
        async () => {
            // some rough tests show that regular save gen is really fast (like, a millisecond)
            // saves will be ~150 kB max, so if we allow up to 5 profiles, we're still good
            console.time("save");

            const saveData = serializeSaveData(generateSaveData());
            localStorage.setItem(`profile:${profiles.current}`, saveData);

            console.timeEnd("save");
        },
        // I'm not sure why this is required.
        { deep: true },
    );

    function generateSaveData(): SavedData {
        return {
            currentGoalID: currentGoalID.value,
            templateName: currentTemplateName.value,
            // get rid of reactivity
            predictedSkillXP: JSON.parse(JSON.stringify(predictedSkillXP.value)),
            completion: JSON.parse(JSON.stringify(completion.value)),
        };
    }

    // This is extracted into an action because setting goals via the Goals tab
    // can also change level up goal completions
    // (I could also watch on level goals, but there's no easy way to detect them)
    function updatePredictedXPLevelUp(skill: string) {
        const goalID = `level:${skill}`;

        // we're not substituting the XP threshold here because we're about to set it
        const previousXP = predictedSkillXP.value[skill] ?? 0;
        const skillLevel = completion.value[goalID];
        if (!skillLevel) {
            throw new Error("Invalid skill level ID");
        }

        // cap skill levels
        const newXP = Math.max(previousXP, skillXPValues[skillLevel] ?? 999999);
        predictedSkillXP.value[skill] = newXP;
    }

    function isPrerequisiteMet(
        prerequisite: Prerequisite,
        // The function to aggregate tag contents with.
        // All prerequisites supply Array.prototype.every,
        // and any prerequisites supply Array.prototype.some.
        aggregateHandler?: typeof Array.prototype.some,
    ): boolean {
        if (!templateData.value) {
            throw new Error("Cannot evaluate prerequisites without template");
        }

        if ("goal" in prerequisite) {
            // single prerequisite

            const requiredCompletion = prerequisite.multiplicity ?? 1;

            if (prerequisite.goal.startsWith("#")) {
                // this is a tag
                const tagName = prerequisite.goal.slice(1);
                const tagGoals = templateData.value.tags[tagName];
                if (!aggregateHandler) {
                    throw new Error("Cannot evaluate tag prerequisite without context");
                }

                return aggregateHandler.call(
                    tagGoals,
                    (tagGoal) => (completion.value[tagGoal] ?? 0) >= requiredCompletion,
                );
            } else {
                return (completion.value[prerequisite.goal] ?? 0) >= requiredCompletion;
            }
        } else {
            // prerequisite group
            if (prerequisite.all) {
                return prerequisite.all.every((prerequisite) =>
                    isPrerequisiteMet(prerequisite, Array.prototype.every),
                );
            } else if (prerequisite.any) {
                return prerequisite.any.some((prerequisite) =>
                    isPrerequisiteMet(prerequisite, Array.prototype.some),
                );
            }
        }
        // empty prerequisite
        return true;
    }

    function isEligible(goal: Goal) {
        // do not roll completed goals
        if ((completion.value[goal.id] ?? 0) >= goal.multiplicity) {
            return false;
        }

        // check for prerequisites
        const reqs = goal.prerequisites;
        if (!isPrerequisiteMet(reqs)) {
            return false;
        }

        // check for XP values
        for (const [skill, impliedXP] of Object.entries(goal.xp)) {
            const level = completion.value[`level:${skill}`] ?? 0;
            // if there is no saved XP prediction, use the current level as a baseline
            let currentXP = predictedSkillXP.value[skill] ?? skillXPValues[level] ?? 0;
            currentXP += impliedXP;
            if (currentXP >= (skillXPValues[level + 1] ?? 999999)) {
                return false;
            }
        }

        return true;
    }

    function rollGoal(cancelledGoals: Set<string>) {
        if (!templateData.value) {
            throw new Error("Cannot roll goal without template");
        }

        let eligibleGoals = new Set<Goal>();
        // use templateData goals directly to iterate easier
        for (const goal of templateData.value.goals) {
            if (isEligible(goal)) {
                eligibleGoals.add(goal);
            }
        }

        // To prevent all the eligible goals being excluded,
        // only disqualify the cancelled goals if they can't exclude all the goals
        // This check is not quite correct, but it's good enough
        // (it can only produce false positives, no false negatives)
        // and some funky stuff would need to happen for it to fail in the first place
        const applyCancels = cancelledGoals.size < eligibleGoals.size;

        const weightedGoals: string[] = [];
        for (const goal of eligibleGoals) {
            if (applyCancels && cancelledGoals.has(goal.id)) {
                // Prevent recently cancelled goals from reappearing
                continue;
            }

            const remainingMultiplicity =
                goal.multiplicity -
                (completion.value[goal.id] ?? throwError(new Error("Could not find goal")));
            for (let i = 0; i < remainingMultiplicity; i++) {
                weightedGoals.push(goal.id);
            }
        }

        if (weightedGoals.length == 0) {
            alert("There are no eligible goals. Please report this");
            return;
        }

        const index = Math.floor(Math.random() * weightedGoals.length);
        currentGoalID.value = weightedGoals[index]!;
    }

    function cancelGoal() {
        currentGoalID.value = null;
    }

    function finishGoal() {
        if (currentGoal.value == null) return;

        if (!completion.value[currentGoal.value.id]) {
            completion.value[currentGoal.value.id] = 0;
        }

        if (completion.value[currentGoal.value.id]! < currentGoal.value.multiplicity) {
            completion.value[currentGoal.value.id]! += 1;
        }

        // update XP prediction for level goal
        let matches = currentGoal.value.id.match(/^level:(.+)$/);
        if (matches) {
            const skill = matches[1]!;
            updatePredictedXPLevelUp(skill);
        }

        // add implied XP to the prediction
        for (const [skill, impliedXP] of Object.entries(currentGoal.value.xp)) {
            let currentXP =
                predictedSkillXP.value[skill] ??
                skillXPValues[completion.value[`level:${skill}`] ?? 0] ??
                0;
            currentXP += impliedXP;
            predictedSkillXP.value[skill] = currentXP;
        }

        cancelGoal();
    }

    // Returns a promise that resolves when the template has loaded.
    // Useful to block component rendering until everything is ready
    async function waitForReady() {
        if (templateData.value) {
            return Promise.resolve();
        }
        return new Promise<void>((res) => {
            const cancel = watch(templateData, () => {
                cancel();
                res();
            });
        });
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
        generateSaveData,
        updatePredictedXPLevelUp,
        rollGoal,
        cancelGoal,
        finishGoal,
        isEligible,
        waitForReady,
    };
});
