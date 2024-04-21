export type DialogContentRenderer = () => VNode[];

export const dialogInjectKey = Symbol() as InjectionKey<{
    alert: (title: string, message: DialogContentRenderer | string) => Promise<void>;
    confirm: (
        title: string,
        message: DialogContentRenderer | string,
        labels?: [string, string],
    ) => Promise<"ok" | "cancel">;
}>;

export function useDialogs() {
    return inject(dialogInjectKey)!;
}
