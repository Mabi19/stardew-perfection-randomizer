<script lang="tsx">
import AppButton from "./AppButton.vue";
import AppDialog from "./AppDialog.vue";

interface Action<ID extends string> {
    id: ID;
    label: string;
    icon?: string;
}

function renderToValue(content: DialogContentRenderer | string): VNode[] | string {
    if (typeof content == "function") {
        return content();
    } else {
        return content;
    }
}

export default defineComponent({
    async setup(_props, { slots }) {
        const open = ref(false);

        // dialog-defining state
        const title = ref("");
        let renderContent: DialogContentRenderer = () => [];
        const actions = ref<Action<any>[]>([]);

        let resolveCallback: ((result: string | null) => void) | null;
        let promise: Promise<string | null> | null = null;

        function handleFinish(actionID: string | null) {
            // promise stuff
            promise = null;
            resolveCallback?.(actionID);

            open.value = false;
        }

        function handleFormSubmit(ev: SubmitEvent) {
            ev.preventDefault();
            // Form was submitted via action button on pressing "Enter" on a form control.
            const actionID = ev.submitter?.dataset?.actionId;
            handleFinish(actionID ?? null);
        }

        // Low-level API to create dialogs.
        // Renders the render function into a dialog with some action buttons.
        // Once one of the action buttons is clicked (or the form is submitted in another way)
        // the returned promise resolves.
        // Side note: Typing this was hard. Thanks, ChatGPT!
        async function createRawDialog<const Actions extends Action<any>[]>(
            dialogTitle: string,
            dialogContent: () => VNode[],
            dialogActions: Actions,
        ): Promise<Actions[number]["id"] | null> {
            // Wait until the previous dialog is complete.
            // If more than one dialog is queued, they will all be shown, but in an unspecified order.
            if (promise) {
                await promise;
            }

            promise = new Promise<string | null>((res) => (resolveCallback = res));
            // There is no await after here, so the promise will not be swapped out during the execution of this function.

            title.value = dialogTitle;
            renderContent = dialogContent;
            actions.value = dialogActions;
            open.value = true;
            return promise;
        }

        const dialogs = {
            async alert(title: string, message: DialogContentRenderer | string) {
                await createRawDialog(title, () => [<>{renderToValue(message)}</>], [
                    { id: "ok", label: "OK" },
                ]);
            },
        };

        provide(dialogInjectKey, dialogs);

        return () => (
            <>
                {slots.default?.()}
                <AppDialog title={title.value} open={open.value}>
                    <form onSubmit={handleFormSubmit as (ev: Event) => void} class="wrapper">
                        <div class="content">{renderContent()}</div>
                        <div class="actions row">
                            {actions.value.map((action) => (
                                <AppButton icon={action.icon} data-action-id={action.id}>
                                    {action.label}
                                </AppButton>
                            ))}
                        </div>
                    </form>
                </AppDialog>
            </>
        );
    },
});
</script>

<style scoped lang="scss">
.actions {
    justify-content: right;
    margin-top: 0.5rem;
}
</style>
