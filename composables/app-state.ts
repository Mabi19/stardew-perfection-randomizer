export const useAppState = () =>
    useState("state", () => makeAppState("hardcore"));
