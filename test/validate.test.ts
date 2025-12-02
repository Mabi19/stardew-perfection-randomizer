import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { validateTemplate } from "../utils/validate";

async function getTemplateFromFile(path: string) {
    const templateString = await readFile(`./templates/${path}`, { encoding: "utf-8" });
    return JSON.parse(templateString);
}

test("standard.json validates", async () => {
    expect(validateTemplate(await getTemplateFromFile("standard.json"))).toBe(true);
});

test("standard_1_6.json validates", async () => {
    expect(validateTemplate(await getTemplateFromFile("standard_1_6.json"))).toBe(true);
});

test("hardcore.json validates", async () => {
    expect(validateTemplate(await getTemplateFromFile("hardcore.json"))).toBe(true);
});

test("hardcore_1_6.json validates", async () => {
    expect(validateTemplate(await getTemplateFromFile("hardcore_1_6.json"))).toBe(true);
});
