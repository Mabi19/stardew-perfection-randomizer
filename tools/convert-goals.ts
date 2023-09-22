import { parse } from "npm:csv-parse@5.5.0/sync";
import { convertNameToID } from "./utils.ts";
import { tags } from "./tags.ts";
import { Skill, goalXPValues, skills } from "./xp.ts";

const filepath = Deno.args[0];
const isHardcore = Deno.args[2].includes("hardcore");

interface RawGoal {
    name: string;
    prerequisites: string;
    image: string;
    complete: boolean;
}

interface Prerequisite {
    goal: string;
    multiplicity?: number;
}
type Prerequisites =
    | { any: Prerequisite[] }
    | { all: Prerequisite[] }
    | Record<string, never>;

interface Goal {
    id: string;
    name: string;
    prerequisites: Prerequisites;
    imageURL: string;
    multiplicity: number;
    xp: Record<Skill, number>;
}

// Read the data from the CSV file

// deno-lint-ignore no-explicit-any
const rawData: any[] = parse(await Deno.readTextFile(filepath), {
    delimiter: ",",
    columns: true,
});

const listOfGoals: Goal[] = rawData.map((entry) => {
    const raw: RawGoal = {
        name: entry["Task"],
        prerequisites: entry["Prerequisites"],
        image: entry["Image"],
        complete: entry["Complete?"] ? true : false,
    };

    // The original spreadsheet only supports one or the other
    const prerequisitesType = raw.prerequisites.includes("|") ? "|" : "&";
    const rawRequirements = raw.prerequisites.split(prerequisitesType);
    const prerequisiteGoals = rawRequirements.map((req) => {
        req = req.trim();

        const result: Prerequisite = { goal: convertNameToID(req) };

        // Tags
        if (result.goal in tags) {
            result.goal = `#${tags[result.goal].name}`;
        }

        // Skill goals: these have a multiplicity of 10
        const skillMatch = req.match(
            /^(Farming|Mining|Foraging|Fishing|Combat) ([1-9]|10)$/,
        );
        if (skillMatch) {
            const [_full, skill, level] = skillMatch;
            result.goal = `gain_a_${skill.toLowerCase()}_level`;
            result.multiplicity = parseInt(level);
        }

        return result;
    });
    const prerequisites =
        prerequisitesType == "|"
            ? { any: prerequisiteGoals }
            : { all: prerequisiteGoals };

    const imageURL = raw.image.match(/^=image\("([a-zA-Z0-9:/._%-]+)"\)$/);
    if (!imageURL) {
        throw new Error(`Bad image specifier: ${raw.image}`);
    }

    const id = convertNameToID(raw.name);

    let xp: [Skill, number][];
    if (isHardcore) {
        xp = skills
            .map((skill) =>
                id in goalXPValues[skill]
                    ? [skill, goalXPValues[skill][id]]
                    : undefined,
            )
            .filter((pair) => pair != undefined) as [Skill, number][];
    } else {
        xp = [];
    }

    const goal: Goal = {
        id,
        name: raw.name,
        // throw in an empty object when no prerequisites
        prerequisites: raw.prerequisites ? prerequisites : {},
        imageURL: imageURL[1],
        multiplicity: 1,
        xp: Object.fromEntries(xp) as Record<Skill, number>,
    };

    return goal;
});

// Deduplicate multi-goals (leveling up, tool upgrades, etc.)
const goalsObject: Record<string, Goal> = {};
for (const goal of listOfGoals) {
    const id = goal.id;
    if (id in goalsObject) {
        goalsObject[id].multiplicity += 1;
    } else {
        goalsObject[id] = goal;
    }
}

const deduplicatedGoals = Object.values(goalsObject);

console.log("goals:", deduplicatedGoals.length);

// prerequisites check
for (const goal of deduplicatedGoals) {
    const prerequisites: Prerequisite[] = [];
    if ("any" in goal.prerequisites) {
        prerequisites.push(...goal.prerequisites.any);
    }
    if ("all" in goal.prerequisites) {
        prerequisites.push(...goal.prerequisites.all);
    }
    for (const prerequisite of prerequisites) {
        if (!(prerequisite.goal in goalsObject)) {
            console.log(prerequisite.goal);
        }
    }
}

const processedTags = Object.fromEntries(
    Object.values(tags).map((tag) => [
        tag.name,
        tag.entries.map((entry) => convertNameToID(entry)),
    ]),
);

const result = {
    tags: processedTags,
    goals: deduplicatedGoals,
};

await Deno.writeTextFile(Deno.args[1], JSON.stringify(result, undefined, 4));
