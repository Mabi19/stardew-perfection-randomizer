export type DialogContentRenderer = () => VNode[];

export const dialogInjectKey = Symbol() as InjectionKey<{
    alert: (title: string, message: DialogContentRenderer | string) => Promise<void>;
}>;

export function useDialogs() {
    return inject(dialogInjectKey)!;
}
