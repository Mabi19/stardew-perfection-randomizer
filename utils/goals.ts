import hardcoreTemplate from "~/templates/hardcore.json";
import standardTemplate from "~/templates/standard.json";

export interface Prerequisite {
    goal: string;
    multiplicity?: number;
}
export interface Prerequisites {
    any?: Prerequisite[];
    all?: Prerequisite[];
}

export interface TemplateGoal {
    id: string;
    name: string;
    prerequisites: Prerequisites;
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

const templates: Record<string, Template> = {
    // The auto-generated JSON types don't quite match here
    // so force them to behave
    standard: standardTemplate as unknown as Template,
    hardcore: hardcoreTemplate as unknown as Template,
};

export function getPredefinedTemplate(templateName: string) {
    if (templateName in templates) {
        // TODO: dynamically fetch the templates
        return templates[templateName];
    }

    return null;
}
