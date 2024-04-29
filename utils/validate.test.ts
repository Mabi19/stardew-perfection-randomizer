import { expect, test } from "vitest";
import { validateTemplate } from "./validate";
import { getPredefinedTemplate } from "./goals";

test("standard.json validates", async () => {
    expect(validateTemplate(await getPredefinedTemplate("standard")!)).toBe(true);
});

test("hardcore.json validates", async () => {
    expect(validateTemplate(await getPredefinedTemplate("hardcore")!)).toBe(true);
});
