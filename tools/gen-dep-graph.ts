import type { Template, Prerequisite } from "../utils/goals.ts";

interface Dependency {
    goalID: string;
    multiplicity: number;
    context: "all" | "any";
}

function* traversePrerequisites(
    reqs: Prerequisite,
    context?: "all" | "any",
): Generator<Dependency, void, void> {
    if ("goal" in reqs) {
        if (!context) {
            throw new Error("Can't define dependency without context");
        }
        // single goal
        yield { goalID: reqs.goal, multiplicity: reqs.multiplicity ?? 1, context };
    } else {
        // prerequisite list
        let list: Prerequisite[] = [];
        let newContext: "all" | "any" | undefined = undefined;
        if (reqs.all) {
            newContext = "all";
            list = reqs.all;
        } else if (reqs.any) {
            newContext = "any";
            list = reqs.any;
        }

        if (newContext) {
            for (const req of list) {
                yield* traversePrerequisites(req, newContext);
            }
        }
    }
}

if (Deno.args.length < 2) {
    console.log("Usage: gen-dep-graph <template file path> <output path>");
    Deno.exit();
}

const inputPath = Deno.args[0];
const outputPath = Deno.args[1];

const data = JSON.parse(await Deno.readTextFile(inputPath)) as Template;
const file = await Deno.open(outputPath, { create: true, write: true });

const encoder = new TextEncoder();

file.write(encoder.encode("strict digraph {\n"));

for (const [name, deps] of Object.entries(data.tags)) {
    file.write(encoder.encode(`    "#${name}" [color=blue]\n`));
    for (const dep of deps) {
        file.write(encoder.encode(`    "#${name}" -> "${dep}"\n`));
    }
}

for (const goal of data.goals) {
    const id = goal.id;
    file.write(encoder.encode(`    ${id}\n`));

    for (const prerequisite of traversePrerequisites(goal.prerequisites)) {
        const color = prerequisite.context == "all" ? "red" : "blue";
        const label = prerequisite.multiplicity == 1 ? "" : `,label="${prerequisite.multiplicity}"`;
        file.write(
            encoder.encode(`    "${id}" -> "${prerequisite.goalID}" [color=${color}${label}]\n`),
        );
    }
}

file.write(encoder.encode("}\n"));
file.close();
