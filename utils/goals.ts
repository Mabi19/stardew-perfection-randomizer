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
    imageURL: string;
    multiplicity: number;
    xp: Record<string, number>;
}

export interface Goal extends TemplateGoal {}

export interface Template {
    tags: Record<string, string[]>;
    goals: TemplateGoal[];
}

const templates: Record<string, Template> = {
    standard: standardTemplate,
    // Something really weird is happening with the types here
    // so force it to behave
    hardcore: hardcoreTemplate as unknown as Template,
};

export function getPredefinedTemplate(templateName: string) {
    if (templateName in templates) {
        return templates[templateName];
    }

    return null;
}
