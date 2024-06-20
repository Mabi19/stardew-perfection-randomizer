export const templateEditorInjectKey = Symbol() as InjectionKey<{
    start(base: Template): Promise<Template>;
}>;

export function useTemplateEditor() {
    return inject(templateEditorInjectKey)!;
}
