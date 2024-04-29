import hardcoreTemplate from "~/templates/hardcore.json?url";
import standardTemplate from "~/templates/standard.json?url";

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

const templateURLs: Record<string, string> = {
    standard: standardTemplate,
    hardcore: hardcoreTemplate,
};

const templateCache = new Map<string, Template>();

export async function getPredefinedTemplate(name: string): Promise<Template> {
    if (templateCache.has(name)) {
        return templateCache.get(name)!;
    } else {
        const template = await (
            await fetch(templateURLs[name] ?? throwError(new Error("Invalid template")))
        ).json();

        templateCache.set(name, template);
        return template;
    }
}
