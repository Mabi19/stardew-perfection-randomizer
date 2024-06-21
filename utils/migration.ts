export interface Migration {
    to: PredefinedTemplateID | Template;
    fixer: (newTemplate: Template, data: SavedData) => void;
}

// Automatically try to match completion format to template goals.
export function autofix(template: Template, data: SavedData) {
    const templateGoalIDs = new Set(template.goals.map((goal) => goal.id));
    const newCompletion: Record<string, number> = {};
    for (const goalID of templateGoalIDs) {
        newCompletion[goalID] = data.completion[goalID] ?? 0;
    }
    data.completion = newCompletion;
}

function renameGoal(data: SavedData, oldID: string, newID: string) {
    data.completion[oldID] = data.completion[newID] ?? 0;
    if (data.currentGoalID == oldID) {
        data.currentGoalID == newID;
    }
}

function saveFixer1_6(newTemplate: Template, data: SavedData) {
    renameGoal(data, "slay_125_cave_insects", "slay_80_cave_insects");
    // this creates completion entries for all the new goals
    // (and deletes Ship a Clam)
    autofix(newTemplate, data);
}

const migrations: Record<string, Migration> = {
    standard: { to: "standard_1_6", fixer: saveFixer1_6 },
    hardcore: { to: "hardcore_1_6", fixer: saveFixer1_6 },
};

export function templateHasMigrations(template: TemplateID) {
    return template in migrations;
}

export async function applyMigration(
    randomizer: ReturnType<typeof useRandomizerStore>,
    profiles: ReturnType<typeof useProfilesStore>,
    saveData: SavedData,
    migration: Migration,
) {
    if (typeof migration.to == "string") {
        migration.fixer(await getPredefinedTemplate(migration.to), saveData);
        saveData.templateName = migration.to;
    } else {
        migration.fixer(migration.to, saveData);
        saveData.templateName = "custom";
        localStorage.setItem(`profileTemplate:${profiles.current}`, JSON.stringify(migration.to));
    }

    // patch the store
    randomizer.currentGoalID = saveData.currentGoalID;
    randomizer.currentTemplateName = saveData.templateName;
    randomizer.predictedSkillXP = saveData.predictedSkillXP;
    randomizer.completion = saveData.completion;
    // set the template ID
    profiles.allProfiles.find((profile) => profile.name == profiles.current)!.template =
        saveData.templateName;
}

export function findMigration(data: SavedData) {
    if (!templateHasMigrations(data.templateName)) {
        return;
    }
    const migration = migrations[data.templateName as keyof typeof migrations]!;
    return migration;
}
