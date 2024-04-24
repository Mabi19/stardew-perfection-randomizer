import { scaleQuaternion } from "../math";
import { Particle, BaseEffectContext } from "./BaseContext";

const confettiVerts = [
    { x: -0.005, y: -0.008 },
    { x: 0.005, y: -0.008 },
    { x: 0.005, y: 0.008 },
    { x: -0.005, y: 0.008 },
] as const;

const LIFESPAN = 10;

const CONFETTI_SPREAD_ANGLE = Math.PI / 3;

export class ConfettiParticle extends Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;

    orientation: Quaternion;
    angularVelocity: Quaternion;

    age: number;
    hue: number;

    constructor(x: number, y: number, vx: number, vy: number) {
        super();
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.orientation = randomUnitQuaternion();
        this.angularVelocity = scaleQuaternion(
            { w: 0, ...randomPointOnSphere() },
            5 + Math.random() * 3,
        );

        this.age = 0;
        this.hue = Math.floor(Math.random() * 10) * 36;
    }

    static randomOfExplosion() {
        const x = 0.4 + Math.random() * 0.2;
        const y = 0.8 + Math.random() * 0.2;

        const velMult = 0.3 + Math.random() * 1.3;
        const velAngle = (Math.random() - 0.5) * CONFETTI_SPREAD_ANGLE;
        const vx = Math.sin(velAngle) * 0.01 * velMult;
        const vy = -Math.cos(velAngle) * 0.01 * velMult;

        return new this(x, y, vx, vy);
    }

    process(context: BaseEffectContext, deltaTime: number) {
        this.age += deltaTime;
        this.x += this.vx;
        this.y += this.vy;

        this.vx -= 3 * deltaTime * this.vx;
        this.vy -= 3 * deltaTime * this.vy;

        // gravity
        this.vy += 0.0015 * deltaTime;

        // https://gamedev.stackexchange.com/questions/108920/applying-angular-velocity-to-quaternion
        this.orientation = normalizeQuaternion(
            addQuaternions(
                this.orientation,
                hamiltonProduct(
                    scaleQuaternion(this.angularVelocity, deltaTime / 2),
                    this.orientation,
                ),
            ),
        );

        return this.age > LIFESPAN;
    }

    transformVert(vert: { x: number; y: number }, context: BaseEffectContext) {
        // rotate
        const rotated = rotatePoint(vert, this.orientation);

        // scale and translate
        // transform vert offsets by the height always, but positions by width/height
        return {
            x: rotated.x * context.sizeInfo.height + this.x * context.sizeInfo.width,
            y: rotated.y * context.sizeInfo.height + this.y * context.sizeInfo.height,
        };
    }

    draw(context: BaseEffectContext) {
        context.draw.fillStyle = `hsla(${this.hue}deg, 100%, 60%, ${
            clamp(0, LIFESPAN - this.age, 1.75) / 2
        })`;
        context.draw.beginPath();
        const firstVert = this.transformVert(confettiVerts[0], context);
        // console.log(firstVert);
        context.draw.moveTo(firstVert.x, firstVert.y);

        for (const vert of confettiVerts.slice(1)) {
            const transformedVert = this.transformVert(vert, context);

            context.draw.lineTo(transformedVert.x, transformedVert.y);
        }
        context.draw.fill();
    }
}
