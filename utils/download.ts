export function downloadBlob(blob: Blob, filename: string) {
    const blobURL = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobURL;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobURL);
}
