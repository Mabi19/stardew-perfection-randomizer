import { defineStore } from "pinia";

interface Profile {
    name: string;
    template: string;
}

export const useProfilesStore = defineStore("profiles", () => {
    const profiles = ref<Profile[]>([]);

    function profileExists(name: string) {
        return Boolean(profiles.value.find((existingProfile) => existingProfile.name == name));
    }

    function createProfile(store: ReturnType<typeof useRandomizerStore> | null, options: Profile) {
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
        localStorage.setItem("currentProfile", options.name);
        localStorage.setItem(`profile:${options.name}`, serialized);

        profiles.value.push(options);

        // if there is no store, we don't need to reload it
        store?.reloadSave();
        navigateTo("/dashboard");
    }

    return {
        profiles,
        // actions
        profileExists,
        createProfile,
    };
});
