import { Particle, BaseEffectContext } from "./BaseContext";

const confettiVerts = [
    { x: -0.006, y: -0.01 },
    { x: 0.006, y: -0.01 },
    { x: 0.006, y: 0.01 },
    { x: -0.006, y: 0.01 },
];

const LIFESPAN = 10;

// TODO: facing angles
// orientation as unit quaternion
// angular velocity is also a quaternion but with no real part
// resources:
// https://math.stackexchange.com/questions/40164/how-do-you-rotate-a-vector-by-a-unit-quaternion
// https://gamedev.stackexchange.com/questions/108920/applying-angular-velocity-to-quaternion

// Potential tweaks:
// - Reduce lightness to make the confetti more vibrant
// - Adjust firing angle and position (narrower angles, wider range of start points?)
// - Make them a bit smaller (perhaps adjust based on canvas size?)

export class ConfettiParticle extends Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;

    age: number;
    hue: number;

    constructor() {
        super();
        this.x = 0.4 + Math.random() * 0.2;
        this.y = 0.8 + Math.random() * 0.2;

        const velMult = 0.3 + Math.random() * 1.2;
        const velAngle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
        this.vx = Math.sin(velAngle) * 0.01 * velMult;
        this.vy = -Math.cos(velAngle) * 0.01 * velMult;

        this.age = 0;
        this.hue = Math.floor(Math.random() * 10) * 36;
    }

    process(context: BaseEffectContext, deltaTime: number) {
        this.age += deltaTime;
        this.x += this.vx;
        this.y += this.vy;

        this.vx -= 3 * deltaTime * this.vx;
        this.vy -= 3 * deltaTime * this.vy;

        return this.age > LIFESPAN;
    }

    transformVert(vert: { x: number; y: number }, context: BaseEffectContext) {
        // transform vert offsets by the height always, but positions by width/height
        return {
            x: vert.x * context.sizeInfo.height + this.x * context.sizeInfo.width,
            y: vert.y * context.sizeInfo.height + this.y * context.sizeInfo.height,
        };
    }

    draw(context: BaseEffectContext) {
        context.draw.fillStyle = `hsla(${this.hue}deg, 100%, 60%, ${
            clamp(0, LIFESPAN - this.age, 1.5) / 2
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
