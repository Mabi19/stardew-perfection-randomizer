export interface SavedData {
    currentGoalID: string | null;
    templateName: TemplateID;
    predictedSkillXP: Record<string, number>;
    completion: Record<string, number>;
}

export interface Profile {
    name: string;
    template: TemplateID;
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

    // TODO: error-check these
    // will probably have to be done somewhere else, as we don't have the template here

    const predictedSkillXP: Record<string, number> = JSON.parse(predictedSkillXPString!);
    const completion: Record<string, number> = JSON.parse(completionString!);

    return {
        currentGoalID: currentGoalID == "@@null" ? null : currentGoalID!,
        templateName: templateName! as TemplateID,
        predictedSkillXP,
        completion,
    };
}

export async function exportProfile(profileID: string) {
    const saveData = localStorage.getItem(`profile:${profileID}`);
    if (!saveData) {
        throw new Error("Could not load current profile");
    }

    const encoder = new TextEncoder();
    const encodedHeader = encoder.encode("sdvpr_v1_packed;");

    const encodedSaveData = encoder.encode(saveData);
    const compressedSaveData = await ByteArrayUtils.compressData(encodedSaveData);
    const saveDataLength = ByteArrayUtils.encodeInteger(compressedSaveData.size);

    const templateParts: BlobPart[] = [];
    const template = localStorage.getItem(`profileTemplate:${profileID}`);
    if (template) {
        const encodedTemplate = encoder.encode(template);
        const compressedTemplate = await ByteArrayUtils.compressData(encodedTemplate);
        const templateLength = ByteArrayUtils.encodeInteger(compressedTemplate.size);

        templateParts.push(templateLength);
        templateParts.push(compressedTemplate);
    } else {
        // 0 bytes
        templateParts.push(ByteArrayUtils.encodeInteger(0));
    }

    const blob = new Blob([encodedHeader, ...templateParts, saveDataLength, compressedSaveData], {
        type: "application/octet-stream",
    });
    downloadBlob(blob, `${profileID}.randomizer`);
}
