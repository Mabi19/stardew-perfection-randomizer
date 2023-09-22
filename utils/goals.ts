import hardcoreTemplate from "~/templates/hardcore.json";
import standardTemplate from "~/templates/standard.json";

interface Prerequisite {
    goal: string;
    multiplicity?: number;
}
interface Prerequisites {
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

export interface Goal extends TemplateGoal {
    complete: number;
}

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

export async function getPredefinedTemplate(templateName: string) {
    if (templateName in templates) {
        return templates[templateName];
    }

    return null;
}

export function loadCompletedGoals(template: Template): {
    tags: Ref<Record<string, string[]>>;
    goals: Ref<Goal[]>;
} {
    return {
        tags: ref(template.tags),
        goals: ref(template.goals.map((goal) => ({ ...goal, complete: 0 }))),
    };
}
