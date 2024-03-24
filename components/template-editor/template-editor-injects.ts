export const prerequisiteCreationFunc = Symbol() as InjectionKey<
    (thisLevelDependencies: string[]) => Promise<SinglePrerequisite>
>;
