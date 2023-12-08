abstract class Particle {
    /** @returns whether to delete the particle */
    abstract process(context: DashboardEffectContext, deltaTime: number): boolean;
    abstract draw(context: DashboardEffectContext): void;
}

class PurpleBlobParticle extends Particle {
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

    process(context: DashboardEffectContext, deltaTime: number) {
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

    draw(context: DashboardEffectContext) {
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

export class DashboardEffectContext {
    canvas: HTMLCanvasElement;
    draw: CanvasRenderingContext2D;
    dashboard: HTMLDivElement;
    settings: ReturnType<typeof useSettingsStore>;

    sizeInfo: {
        width: number;
        height: number;
    };
    particles: Particle[];

    lastTick: number;
    challengeFinishPercent: number;

    constructor(
        canvas: HTMLCanvasElement,
        dashboard: HTMLDivElement,
        settings: ReturnType<typeof useSettingsStore>,
    ) {
        this.canvas = canvas;
        this.draw = canvas.getContext("2d")!;
        this.dashboard = dashboard;
        this.settings = settings;

        // @ts-ignore
        this.sizeInfo = {};
        this.particles = [];
        this.lastTick = performance.now();
        this.challengeFinishPercent = 0.5;

        const resizeObserver = new ResizeObserver((_entries) => {
            this.recalculatePositions();
        });
        resizeObserver.observe(canvas);
        this.recalculatePositions();
    }

    recalculatePositions() {
        console.log("recalculating");

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.sizeInfo.width = this.canvas.clientWidth;
        this.sizeInfo.height = this.canvas.clientHeight;
    }

    updateFinishPercent(newFinishPercent: number) {
        this.challengeFinishPercent = newFinishPercent;
        console.log("finish percent:", this.challengeFinishPercent);
    }

    aspectRatio() {
        return this.sizeInfo.width / this.sizeInfo.height;
    }

    finishGoalHook() {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new PurpleBlobParticle());
        }

        this.lastTick = performance.now();
        this.tick();
    }

    tick() {
        const currentTime = performance.now();

        this.process((currentTime - this.lastTick) / 1000);
        this.render();

        this.lastTick = currentTime;

        // only redo when necessary
        requestAnimationFrame(() => {
            if (this.particles.length) {
                this.tick();
            }
        });
    }

    process(deltaTime: number) {
        //* This function has side effects, but doing this without filter() is very clunky
        this.particles = this.particles.filter((particle) => !particle.process(this, deltaTime));
    }

    render() {
        // console.log("rendering", this.particles);

        this.draw.clearRect(0, 0, this.sizeInfo.width, this.sizeInfo.height);

        for (const particle of this.particles) {
            particle.draw(this);
        }
    }
}
