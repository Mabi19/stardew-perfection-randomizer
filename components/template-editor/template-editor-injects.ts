export const reverseGoalDependencies = Symbol() as InjectionKey<
    ComputedRef<Record<string, Set<string>>>
>;

export const prerequisiteCreationFunc = Symbol() as InjectionKey<() => Promise<SinglePrerequisite>>;
