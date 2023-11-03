import { defineStore } from "pinia";

export const useProfilesStore = defineStore("profiles", () => {
    const allProfiles = ref<Profile[]>(JSON.parse(localStorage.getItem("allProfiles") ?? "[]"));
    const current = ref<string | null>(localStorage.getItem("currentProfile"));

    watch(
        allProfiles,
        () => {
            localStorage.setItem("allProfiles", JSON.stringify(allProfiles.value));
        },
        { deep: true },
    );

    watch(current, () => {
        if (current.value) {
            localStorage.setItem("currentProfile", current.value);
        } else {
            localStorage.removeItem("currentProfile");
        }
    });

    function profileExists(name: string) {
        return Boolean(allProfiles.value.find((existingProfile) => existingProfile.name == name));
    }

    function createProfile(options: Profile) {
        const templateData = getPredefinedTemplate(options.template);

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

        allProfiles.value.push(options);
        current.value = options.name;

        const serialized = serializeSaveData(data);
        localStorage.setItem(`profile:${options.name}`, serialized);

        navigateTo("/dashboard");
    }

    return {
        allProfiles,
        current,
        // actions
        profileExists,
        createProfile,
    };
});
