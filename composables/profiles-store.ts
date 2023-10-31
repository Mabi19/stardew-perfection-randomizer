import { defineStore } from "pinia";

interface Profile {
    name: string;
    template: string;
}

export const useProfilesStore = defineStore("profiles", () => {
    const profiles = ref<Profile[]>([]);
    const current = ref<string | null>(localStorage.getItem("currentProfile"));

    watch(current, () => {
        if (current.value) {
            localStorage.setItem("currentProfile", current.value);
        } else {
            localStorage.removeItem("currentProfile");
        }
    });

    function profileExists(name: string) {
        return Boolean(profiles.value.find((existingProfile) => existingProfile.name == name));
    }

    function createProfile(options: Profile) {
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

        profiles.value.push(options);
        current.value = options.name;

        const serialized = serializeSaveData(data);
        localStorage.setItem(`profile:${options.name}`, serialized);

        navigateTo("/dashboard");
    }

    return {
        profiles,
        current,
        // actions
        profileExists,
        createProfile,
    };
});
