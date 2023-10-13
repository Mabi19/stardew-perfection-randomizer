import { defineStore } from "pinia";

export const useAppStore = defineStore("state", () => {
    // TODO: load from save
    // Tied to the currently loaded save file.
    const currentTemplateName = ref("hardcore");
    const currentGoalID = ref<string | null>(null);

    const templateData = computed<Template>(
        () => getTemplate(currentTemplateName.value)!,
    );
    if (!templateData.value) {
        throw new Error(`Could not find template ${currentTemplateName.value}`);
    }

    // This is also tied to the current state of the save file.
    const completion = ref(
        Object.fromEntries(
            templateData.value!.goals.map((goal) => [goal.id, 0]),
        ),
    );

    // we're not adding the completion in here for performance
    const goals = computed(() =>
        Object.fromEntries(
            templateData.value!.goals.map((goal) => [goal.id, goal as Goal]),
        ),
    );

    const currentGoal = computed(() => {
        // @ts-ignore: TS is ignoring my optional chaining here for some reason
        return (goals.value?.[currentGoalID.value] ?? null) as Goal | null;
    });

    // TODO: actions for saving, finishing goals, etc.

    watch(
        [currentGoalID, completion],
        () => {
            console.log("saving");
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

    return {
        // state & getters
        currentTemplateName,
        currentGoalID,
        templateData,
        completion,
        goals,
        currentGoal,
        // actions
        rollGoal,
    };
});
