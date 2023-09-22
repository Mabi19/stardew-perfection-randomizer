export function convertNameToID(name: string) {
    return name
        .trim()
        .replaceAll(" ", "_")
        .toLowerCase()
        .replaceAll(/[^a-z0-9_]+/g, "");
}
