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

// https://math.stackexchange.com/a/1586185
export function randomPointOnSphere(): Vector3 {
    const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2;
    const lambda = 2 * Math.PI * Math.random();

    return {
        x: Math.cos(phi) * Math.cos(lambda),
        y: Math.cos(phi) * Math.sin(lambda),
        z: Math.sin(phi),
    };
}

// https://mathworld.wolfram.com/Quaternion.html
export function hamiltonProduct(a: Quaternion, b: Quaternion): Quaternion {
    // I hope I transcribed this correctly
    // 2024-04-25 UPDATE: I did not, in fact, transcribe that correctly
    return {
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    };
}

export function addQuaternions(a: Quaternion, b: Quaternion): Quaternion {
    return {
        w: a.w + b.w,
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    };
}

export function scaleQuaternion(quat: Quaternion, scale: number): Quaternion {
    return {
        w: quat.w * scale,
        x: quat.x * scale,
        y: quat.y * scale,
        z: quat.z * scale,
    };
}

export function normalizeQuaternion(quat: Quaternion) {
    const norm = Math.sqrt(quat.w ** 2 + quat.x ** 2 + quat.y ** 2 + quat.z ** 2);

    return scaleQuaternion(quat, 1 / norm);
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
