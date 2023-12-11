export function lerp(a: number, b: number, time: number) {
    return a + time * (b - a);
}

export function clamp(min: number, x: number, max: number) {
    return Math.min(Math.max(min, x), max);
}

export interface Quaternion {
    w: number;
    x: number;
    y: number;
    z: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Vector2 {
    x: number;
    y: number;
}

// https://stackoverflow.com/a/44031492
export function randomUnitQuaternion(): Quaternion {
    const u = Math.random();
    const v = Math.random();
    const w = Math.random();

    return {
        w: Math.sqrt(1 - u) * Math.sin(2 * Math.PI * v),
        x: Math.sqrt(1 - u) * Math.cos(2 * Math.PI * v),
        y: Math.sqrt(u) * Math.sin(2 * Math.PI * w),
        z: Math.sqrt(u) * Math.cos(2 * Math.PI * w),
    };
}

// https://www.wikiwand.com/en/Quaternion#Hamilton_product
function hamiltonProduct(a: Quaternion, b: Quaternion): Quaternion {
    // I hope I transcribed this correctly
    return {
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y + a.x * b.z + a.y * b.w + a.z * b.x,
        z: a.w * b.z + a.x * b.y + a.y * b.x + a.z * b.w,
    };
}

export function rotatePoint(point: Vector2, orientation: Quaternion): Vector3 {
    const revOrientation = {
        w: orientation.w,
        x: -orientation.x,
        y: -orientation.y,
        z: -orientation.z,
    };

    const pointQuaternion = {
        ...point,
        w: 0,
        z: 0,
    };

    const transformedPoint = hamiltonProduct(
        hamiltonProduct(orientation, pointQuaternion),
        revOrientation,
    );

    return {
        x: transformedPoint.x,
        y: transformedPoint.y,
        z: transformedPoint.z,
    };
}
