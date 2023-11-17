import { defineStore } from "pinia";

interface ProfileImportData {
    name: string;
    profileData: string;
    templateData: string | null;
}

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

    async function importProfile(data: ProfileImportData) {
        localStorage.setItem(`profile:${data.name}`, data.profileData);
        if (data.templateData) {
            localStorage.setItem(`profileTemplate:${data.name}`, data.templateData);
        }

        allProfiles.value.push({
            name: data.name,
            // parsing the profile data again could be skipped,
            // but this isn't done often at all
            template: deserializeSaveData(data.profileData).templateName,
        });
        current.value = data.name;

        await navigateTo("/dashboard");
    }

    async function createProfile(options: Profile) {
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

        await navigateTo("/dashboard");
    }

    function deleteProfile(name: string) {
        if (current.value == name) {
            throw new Error("Can't delete current profile");
        }

        if (!profileExists(name)) {
            throw new Error("Profile does not exist");
        }

        // localStorage is idempotent, so we can always delete the template even if it does not exist
        localStorage.removeItem(`profile:${name}`);
        localStorage.removeItem(`profileTemplate:${name}`);

        // remove the profile from the profiles list
        allProfiles.value = allProfiles.value.filter((profile) => profile.name != name);
        // we don't have to change the current profile name because deleting the current profile is not allowed
    }

    // Check for already existing profile names.
    function findGoodProfileName(baseName: string) {
        let iter = 0;
        let name = "";
        do {
            const iterPart = iter ? ` (#${iter + 1})` : "";

            name = `${baseName}${iterPart}`;

            iter++;
        } while (profileExists(name));

        return name;
    }

    return {
        allProfiles,
        current,
        // actions
        profileExists,
        importProfile,
        createProfile,
        deleteProfile,
        findGoodProfileName,
    };
});
