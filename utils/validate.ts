function expectNoThrow(func: Function) {
    try {
        func();
        return true;
    } catch (e) {
        return false;
    }
}

function isValidGoalID(id: string) {
    return Boolean(id.match(/^[A-Za-z0-9:_]+$/));
}

function isValidPrerequisites(reqs: Prerequisites) {
    if (typeof reqs != "object") return false;

    // empty prerequisites list
    if (!("all" in reqs || "any" in reqs)) {
        return true;
    }

    // only one of these may exist on an object
    if ("all" in reqs != "any" in reqs) {
        // we have just verified this
        const reqsList = (reqs.all ?? reqs.any) as Prerequisite[];
        return reqsList.every(
            (requirement) =>
                typeof requirement == "object" &&
                typeof requirement.goal == "string" &&
                (typeof requirement.multiplicity == "number" ||
                    typeof requirement.multiplicity == "undefined"),
        );
    }

    return false;
}

export function validateTemplate(template: Template) {
    console.time("template validation");

    // basic structure
    if (typeof template != "object") {
        return false;
    }

    if (!("tags" in template) || !("goals" in template)) {
        return false;
    }

    // tags is a Record<string, string[]>
    if (
        typeof template.tags != "object" ||
        !Object.values(template.tags).every(
            (tag) => Array.isArray(tag) && tag.every((goal) => typeof goal == "string"),
        )
    ) {
        return false;
    }

    // goals is a TemplateGoal[]

    if (
        !Array.isArray(template.goals) ||
        !template.goals.every(
            (goal) =>
                typeof goal.id == "string" &&
                isValidGoalID(goal.id) &&
                // valid URL or nothing
                (goal.imageURL == undefined || typeof goal.imageURL == "string") &&
                expectNoThrow(() => goal.imageURL == undefined || new URL(goal.imageURL)) &&
                // positive integer
                typeof goal.multiplicity == "number" &&
                goal.multiplicity > 0 &&
                Math.floor(goal.multiplicity) == goal.multiplicity &&
                // any string
                typeof goal.name == "string" &&
                // Record<string, number>
                typeof goal.xp == "object" &&
                Object.entries(goal.xp).every(
                    ([skill, xp]) => typeof skill == "string" && typeof xp == "number" && xp > 0,
                ) &&
                // Prerequisites
                isValidPrerequisites(goal.prerequisites),
        )
    ) {
        return false;
    }

    const goalMultiplicities = Object.fromEntries(
        template.goals.map((goal) => [goal.id, goal.multiplicity]),
    );

    // validate that all references are valid
    // goal IDs and tag names with a #
    const validIDs = new Set([
        ...template.goals.map((goal) => goal.id),
        ...Object.keys(template.tags).map((tagName) => `#${tagName}`),
    ]);
    // check for duplicates
    if (validIDs.size != template.goals.length + Object.keys(template.tags).length) {
        return false;
    }

    // goals
    for (const goal of template.goals) {
        for (const skill of Object.keys(goal.xp)) {
            if (!validIDs.has(`level:${skill}`)) {
                return false;
            }
        }

        const prerequisites = goal.prerequisites.all ?? goal.prerequisites.any ?? [];
        for (const req of prerequisites) {
            if (!validIDs.has(req.goal)) {
                return false;
            }

            if (req.multiplicity) {
                // tags don't have multiplicities
                if (req.goal.startsWith("#")) return false;

                if (req.multiplicity > goalMultiplicities[req.goal]) {
                    return false;
                }

                //* This does not validate that the requirements are theoretically reachable (which is intended)
            }
        }
    }

    // tag references
    for (const references of Object.values(template.tags)) {
        if (!references.every((reference) => validIDs.has(reference))) {
            return false;
        }
    }

    console.timeEnd("template validation");
    return true;
}

export function validateProfileData(profile: string, customTemplate?: Template) {
    console.time("profile validation");

    const parsedProfile = deserializeSaveData(profile);

    const validTemplates = new Set(["hardcore", "standard", "custom"]);
    if (!validTemplates.has(parsedProfile.templateName)) {
        return false;
    }

    const template =
        parsedProfile.templateName == "custom"
            ? customTemplate
            : getPredefinedTemplate(parsedProfile.templateName);
    if (!template) {
        return false;
    }

    const validGoals = new Map(template.goals.map((goal) => [goal.id, goal]));

    if (parsedProfile.currentGoalID && !validGoals.has(parsedProfile.currentGoalID)) {
        return false;
    }

    if (
        !Object.entries(parsedProfile.predictedSkillXP).every(
            ([skill, xp]) =>
                // check for corresponding level goal
                typeof skill == "string" &&
                validGoals.has(`level:${skill}`) &&
                // XP has to be positive
                typeof xp == "number" &&
                xp > 0,
        )
    ) {
        return false;
    }

    // The completion keys should be the exact same as the goal IDs
    // checking for equal lengths and each completion key having a goal
    if (template.goals.length != Object.keys(parsedProfile.completion).length) {
        return false;
    }

    if (
        !Object.entries(parsedProfile.completion).every(([goalID, completion]) => {
            const goal = validGoals.get(goalID);
            return (
                // the goal actually exists
                typeof goalID == "string" &&
                goal &&
                // completion is in the valid range
                typeof completion == "number" &&
                completion >= 0 &&
                goal.multiplicity >= completion
            );
        })
    ) {
        return false;
    }

    console.timeEnd("profile validation");
    return true;
}
