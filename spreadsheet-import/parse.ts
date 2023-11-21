import { read } from "xlsx";

function convertNameToID(name: string) {
    return name
        .trim()
        .replaceAll(" ", "_")
        .toLowerCase()
        .replaceAll(/[^a-z0-9_]+/g, "");
}

function parsePrerequisites(prerequisites: string) {
    throw new Error("Parsing prerequisites not implemented");
}

function parseImageFormula(formula: string) {
    return formula.match(/^IMAGE\(\"(.+)\"\)$/)?.[1];
}

function objectsEqual(obj1: unknown, obj2: unknown) {
    if (typeof obj1 != typeof obj2) {
        return false;
    }

    if (obj1 === obj2) {
        // trivially equal
        return true;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // array

        if (obj1.length != obj2.length) {
            return false;
        }

        for (let i = 0; i < obj1.length; i++) {
            if (!objectsEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
    }

    if (typeof obj1 == "object" && typeof obj2 == "object") {
        if (obj1 === null || obj2 === null) {
            // only one of these is null
            // (if both are null they are trivially equal)
            return false;
        }

        // other object
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length != keys2.length) {
            return false;
        }

        for (const key of keys1) {
            if (!keys2.includes(key)) {
                return false;
            }

            // @ts-ignore
            return objectsEqual(obj1[key], obj2[key]);
        }
    }
}

export function parseSpreadsheet(data: Uint8Array) {
    console.log("parsing spreadsheet");

    const workbook = read(data, { dense: true });

    if (
        !(
            workbook.SheetNames.includes("Dashboard") &&
            workbook.SheetNames.includes("List of Goals") &&
            workbook.SheetNames.includes("Metadata")
        )
    ) {
        throw new Error("Could not find all required worksheets");
    }

    const metadata = workbook.Sheets["Metadata"];
    const testCell = metadata["!data"]![12][0];

    let randomizerType = "";

    if (testCell.v == "Bundles Completed") {
        randomizerType = "standard";
    } else if (testCell.v == "Combat XP Threshold") {
        randomizerType = "hardcore";
    }

    console.log(randomizerType);

    const baseTemplate = getPredefinedTemplate(randomizerType);

    if (!baseTemplate) {
        throw new Error("Could not get template");
    }

    const baseGoalsByName = Object.fromEntries(baseTemplate.goals.map((goal) => [goal.name, goal]));
    const rawSpreadsheetGoals = workbook.Sheets["List of Goals"]["!data"]!.slice(1).map((row) => ({
        name: row[0].v!.toString(),
        prerequisites: row[1]?.v?.toString(),
        imageFormula: row[2]?.f?.toString(),
        complete: row[3]?.v == "Y",
    }));

    // deduplicate goals
    const spreadsheetGoals: Record<string, TemplateGoal> = {};
    for (const rawGoal of rawSpreadsheetGoals) {
        if (!(rawGoal.name in spreadsheetGoals)) {
            spreadsheetGoals[rawGoal.name] = {
                // if an ID for this goal exists, use it
                // otherwise generate
                id: baseGoalsByName[rawGoal.name]?.id ?? convertNameToID(rawGoal.name),
                name: rawGoal.name,
                imageURL: parseImageFormula(rawGoal.imageFormula ?? "") ?? "",
                // always parse prerequisites
                prerequisites:
                    baseGoalsByName[rawGoal.name]?.prerequisites ??
                    parsePrerequisites(rawGoal.prerequisites ?? ""),
                multiplicity: 0,
                // this is hardcoded, so we can only provide an empty object as backup
                xp: baseGoalsByName[rawGoal.name]?.xp ?? {},
            };
        }

        spreadsheetGoals[rawGoal.name].multiplicity += 1;

        // TODO: track completion
    }

    if (!objectsEqual(spreadsheetGoals, baseGoalsByName)) {
        throw new Error("Template seems to be customized, which is not supported yet");
    }

    console.log(spreadsheetGoals);
}
