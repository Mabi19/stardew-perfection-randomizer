export function lerp(a: number, b: number, time: number) {
    return a + time * (b - a);
}

export function clamp(min: number, x: number, max: number) {
    return Math.min(Math.max(min, x), max);
}
