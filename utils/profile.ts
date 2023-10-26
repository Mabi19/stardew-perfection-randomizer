interface SaveFileOptions {
    template: string;
    profileName: string;
}

export function createProfile(
    store: ReturnType<typeof useRandomizerStore> | null,
    options: SaveFileOptions,
) {
    const templateData = getTemplate(options.template);

    if (!templateData) {
        throw new Error("Unknown template");
    }

    const completion = Object.fromEntries(templateData.goals.map((goal) => [goal.id, 0]));

    const data = {
        currentGoalID: null,
        templateName: options.template,
        predictedSkillXP: {},
        completion,
    };

    const serialized = serializeSaveData(data);
    localStorage.setItem("currentProfile", options.profileName);
    localStorage.setItem(`profile:${options.profileName}`, serialized);

    // if there is no store, we don't need to reload it
    store?.reloadSave();
    navigateTo("/dashboard");
}
