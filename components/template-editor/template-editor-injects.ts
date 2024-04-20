export const goalSelectorFunc = Symbol() as InjectionKey<
    (disqualified: Set<string>, useMultiplicity: boolean) => Promise<SinglePrerequisite>
>;

export const currentEditedGoal = Symbol() as InjectionKey<Ref<Goal | null>>;
