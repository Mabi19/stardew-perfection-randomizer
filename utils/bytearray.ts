namespace ByteArrayUtils {
    export function encodeInteger(num: number) {
        return Uint8Array.of(
            (num & 0xff000000) >> 24,
            (num & 0x00ff0000) >> 16,
            (num & 0x0000ff00) >> 8,
            (num & 0x000000ff) >> 0,
        );
    }

    export async function compressData(data: Uint8Array) {
        const stream = new CompressionStream("gzip");
        // write it to the stream...
        const piped = new Response(data).body!.pipeThrough(stream);
        // and read it back
        return await new Response(piped).blob();
    }
}

export { ByteArrayUtils };
