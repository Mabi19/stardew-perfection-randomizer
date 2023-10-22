interface SavedData {
    currentGoalID: string | null;
    templateName: string;
    predictedSkillXP: Record<string, number>;
    completion: Record<string, number>;
}

// Base64 utilities, mostly used as an escape hatch for controlling user input
const Base64 = {
    encodeString(data: string) {
        return btoa(String.fromCodePoint(...new TextEncoder().encode(data)));
    },
};

export function serializeSaveData(data: SavedData) {
    const parts = [
        "sdvpr_v1",
        data.templateName,
        data.currentGoalID ?? "@@null",
        // these are objects where the keys are /[A-Za-z:_]+/ strings and numbers, so no semicolons here
        JSON.stringify(data.predictedSkillXP),
        JSON.stringify(data.completion),
    ];

    console.log(data.predictedSkillXP);

    const result = parts.join(";");

    return result;
}

export function deserializeSaveData(stringified: string): SavedData {
    const parts = stringified.split(";");
    if (parts.length != 5) {
        throw new Error("Invalid save data");
    }

    const [saveFormat, templateName, currentGoalID, predictedSkillXPString, completionString] =
        parts;

    if (saveFormat != "sdvpr_v1") {
        throw new Error("Unknown save format");
    }

    console.log(predictedSkillXPString);

    // TODO: error check these

    const predictedSkillXP: Record<string, number> = JSON.parse(predictedSkillXPString);
    const completion: Record<string, number> = JSON.parse(completionString);

    return {
        currentGoalID: currentGoalID == "@@null" ? null : currentGoalID,
        templateName,
        predictedSkillXP,
        completion,
    };
}
