import { getPredefinedTemplate } from "./goals";

export interface AppState {
    templateName: string;
    template: Template;

    goals: Goal[];
}

export function makeAppState(templateName: string) {
    const template = getPredefinedTemplate(templateName);
    if (!template) {
        throw new Error(`Could not find template ${templateName}`);
    }

    const state: Partial<AppState> = {};

    state.template = template;
    state.templateName = templateName;

    state.goals = template.goals.map((goal) => ({ ...goal, complete: 0 }));

    return state as AppState;
}
