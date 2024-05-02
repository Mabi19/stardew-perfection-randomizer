import hardcoreTemplate from "~/templates/hardcore.json?url";
import standardTemplate from "~/templates/standard.json?url";
import hardcoreTemplate1_6 from "~/templates/hardcore_1_6.json?url";
import standardTemplate1_6 from "~/templates/standard_1_6.json?url";

export interface SinglePrerequisite {
    goal: string;
    multiplicity?: number;
}
export type Prerequisite = SinglePrerequisite | PrerequisiteGroup;

export interface PrerequisiteGroup {
    any?: Prerequisite[];
    all?: Prerequisite[];
}

export interface TemplateGoal {
    id: string;
    name: string;
    prerequisites: PrerequisiteGroup;
    imageURL?: string;
    multiplicity: number;
    xp: Record<string, number>;
}

export interface Goal extends TemplateGoal {}

export interface Template {
    ruleset?: "hardcore" | "standard";
    tags: Record<string, string[]>;
    goals: TemplateGoal[];
}

const templateURLs = {
    standard: standardTemplate,
    hardcore: hardcoreTemplate,
    hardcore_1_6: hardcoreTemplate1_6,
    standard_1_6: standardTemplate1_6,
} as const;

export type PredefinedTemplateID = keyof typeof templateURLs;
export type TemplateID = PredefinedTemplateID | "custom";

export const templateNames: Record<TemplateID, string> = {
    standard: "Standard (1.5)",
    hardcore: "Hardcore (1.5)",
    hardcore_1_6: "Hardcore",
    standard_1_6: "Standard",
    custom: "Custom",
};

const templateCache = new Map<string, Template>();

export async function getPredefinedTemplate(name: PredefinedTemplateID): Promise<Template> {
    if (templateCache.has(name)) {
        return templateCache.get(name)!;
    } else {
        const template = await $fetch<Template>(
            templateURLs[name] ?? throwError(new Error("Invalid template")),
            {
                responseType: "json",
            },
        );

        // quick check
        if (typeof template != "object") {
            throw new Error("Loaded template is invalid");
        }

        templateCache.set(name, template);
        return template;
    }
}
