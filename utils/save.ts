interface SaveDataInput {
    currentGoalID: string | null;
    templateName: string;
    completion: Record<string, number>;
}

// Base64 utilities, mostly used as an escape hatch for controlling user input
const Base64 = {
    encodeString(data: string) {
        return btoa(String.fromCodePoint(...new TextEncoder().encode(data)));
    },
};

export function serializeSaveData(data: SaveDataInput) {
    const parts = [
        "sdvpr_v1",
        // default template
        "default",
        // In the future, this may be the template's JSON data; we'll need to b64 encode it in this case
        data.templateName,
        data.currentGoalID ?? "@@null",
        // this is JSON where the keys are /[A-Za-z:_]+/ strings and numbers, so no semicolons here
        JSON.stringify(data.completion),
    ];

    const result = parts.join(";");

    return result;
}

export function deserializeSaveData(stringified: string) {
    const parts = stringified.split(";");
    if (parts.length != 5) {
        throw new Error("Invalid save data");
    }

    const [
        saveFormat,
        templateType,
        templateName,
        currentGoalID,
        completionString,
    ] = parts;

    if (saveFormat != "sdvpr_v1") {
        throw new Error("Unknown save format");
    }

    if (templateType != "default") {
        throw new Error("Custom templates unsupported yet");
    }

    const completion: Record<string, number> = JSON.parse(completionString);

    return {
        currentGoalID: currentGoalID == "@@null" ? null : currentGoalID,
        templateName,
        completion,
    } as SaveDataInput;
}
