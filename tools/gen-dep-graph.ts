import type { Template } from "../utils/goals.ts";

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
    file.write(encoder.encode(`    ${id}`));
    if (goal.prerequisites.all) {
        for (const prerequisite of goal.prerequisites.all) {
            const multiplicity = prerequisite.multiplicity ?? 1;
            const label = multiplicity == 1 ? "" : `,label="${multiplicity}"`;
            file.write(
                encoder.encode(`    "${id}" -> "${prerequisite.goal}" [color=red${label}]\n`),
            );
        }
    }
    if (goal.prerequisites.any) {
        for (const prerequisite of goal.prerequisites.any) {
            const multiplicity = prerequisite.multiplicity ?? 1;
            const label = multiplicity == 1 ? "" : `,label="${multiplicity}"`;
            file.write(
                encoder.encode(`    "${id}" -> "${prerequisite.goal}" [color=blue${label}]\n`),
            );
        }
    }
}

file.write(encoder.encode("}\n"));
file.close();
