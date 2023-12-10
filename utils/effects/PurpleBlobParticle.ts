import { Particle, BaseEffectContext } from "./BaseContext";

export class PurpleBlobParticle extends Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;

    constructor() {
        super();
        this.x = 0.5;
        this.y = 0.5;

        const speedMult = 1.5 * Math.random() + 0.3;
        const direction = Math.random() * 2 * Math.PI;
        this.vx = 0.5 * Math.cos(direction) * speedMult;
        this.vy = 0.5 * Math.sin(direction) * speedMult - 0.2;
    }

    process(context: BaseEffectContext, deltaTime: number) {
        const barXPosition = context.challengeFinishPercent;
        const barYPosition = 1.0;

        const dx = barXPosition - this.x;
        // only move down
        const dy = Math.abs(barYPosition - this.y);
        const length = Math.sqrt(dx ** 2 + dy ** 2);
        this.vx = lerp(this.vx, dx / length, 3 * deltaTime);
        this.vy = lerp(this.vy, dy / length, 2 * deltaTime);

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        return this.y > 1.1;
    }

    draw(context: BaseEffectContext) {
        context.draw.fillStyle = "rebeccapurple";
        context.draw.beginPath();
        context.draw.ellipse(
            this.x * context.sizeInfo.width,
            this.y * context.sizeInfo.height,
            (0.01 * context.sizeInfo.width) / context.aspectRatio(),
            0.01 * context.sizeInfo.height,
            0,
            0,
            2 * Math.PI,
        );
        context.draw.fill();
    }
}
