export const reverseGoalDependencies = Symbol() as InjectionKey<
    ComputedRef<Record<string, string[]>>
>;