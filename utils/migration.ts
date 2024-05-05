interface Migration {
    to: PredefinedTemplateID;
    fixer: (newTemplate: Template, data: SavedData) => void;
}

// Automatically try to match completion format to template goals.
function autofix(template: Template, data: SavedData) {
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

export async function migrateCurrentSaveFile(data: SavedData) {
    if (!templateHasMigrations(data.templateName)) {
        return;
    }
    const migration = migrations[data.templateName as keyof typeof migrations]!;
    migration.fixer(await getPredefinedTemplate(migration.to), data);

    data.templateName = migration.to;
}
