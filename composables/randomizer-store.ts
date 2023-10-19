import { defineStore } from "pinia";

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
        [currentGoalID, completion],
        async () => {
            // This is just a rough test for now.
            // some rough tests show that regular save gen is really fast (like, a millisecond)
            // saves will be ~150 kB max, so if we allow up to 5 profiles, we're still good
            console.time("save");

            const saveData = serializeSaveData({
                currentGoalID: currentGoalID.value,
                templateName: currentTemplateName.value,
                completion: completion.value,
            });
            localStorage.setItem(`profile:${profile}`, saveData);

            console.timeEnd("save");
        },
        // I'm not sure why this is required.
        { deep: true },
    );

    function rollGoal() {
        // TODO: all the checks from the original spreadsheet
        const eligibleGoals = Object.values(goals.value).filter(
            (goal) =>
                goal.id != currentGoalID.value &&
                completion.value[goal.id] < goal.multiplicity,
        );
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

        cancelGoal();
    }

    return {
        // state & getters
        currentTemplateName,
        currentGoalID,
        templateData,
        completion,
        goals,
        currentGoal,
        completedCount,
        totalCount,
        // actions
        rollGoal,
        cancelGoal,
        finishGoal,
    };
});
