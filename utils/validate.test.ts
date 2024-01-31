import { expect, test } from "vitest";
import { validateTemplate } from "./validate";
import { getPredefinedTemplate } from "./goals";

test("standard.json validates", () => {
    expect(validateTemplate(getPredefinedTemplate("standard")!)).toBe(true);
});

test("hardcore.json validates", () => {
    expect(validateTemplate(getPredefinedTemplate("hardcore")!)).toBe(true);
});
