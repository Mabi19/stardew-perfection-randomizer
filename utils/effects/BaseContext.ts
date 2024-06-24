export abstract class Particle {
    /** @returns whether to delete the particle */
    abstract process(context: BaseEffectContext, deltaTime: number): boolean;
    abstract draw(context: BaseEffectContext): void;
}

// To avoid circular imports, declare the hooks externally
export class BaseEffectContext {
    canvas: HTMLCanvasElement;
    draw: CanvasRenderingContext2D;
    abortController: AbortController;
    dashboard: HTMLDivElement;
    settings: ReturnType<typeof useSettingsStore>;

    sizeInfo: {
        width: number;
        height: number;
    };
    mousePos: {
        x: number;
        y: number;
    };

    particles: Particle[];
    // particles to be added after processing
    particleQueue: Particle[];

    lastTick: number;
    isTicking: boolean;

    challengeFinishPercent: number;

    constructor(
        canvas: HTMLCanvasElement,
        dashboard: HTMLDivElement,
        settings: ReturnType<typeof useSettingsStore>,
    ) {
        this.canvas = canvas;
        this.draw = canvas.getContext("2d")!;
        this.abortController = new AbortController();
        this.mousePos = { x: 0.5, y: 0.5 };
        document.addEventListener(
            "mousemove",
            (ev) => {
                const bbox = this.canvas.getBoundingClientRect();
                this.mousePos.x = (ev.clientX - bbox.left - window.scrollX) / this.sizeInfo.width;
                this.mousePos.y = (ev.clientY - bbox.top - window.scrollY) / this.sizeInfo.height;
            },
            { signal: this.abortController.signal },
        );

        this.dashboard = dashboard;
        this.settings = settings;

        // @ts-ignore
        this.sizeInfo = {};
        this.particles = [];
        this.particleQueue = [];
        this.lastTick = performance.now();
        this.isTicking = false;

        this.challengeFinishPercent = 0.5;

        const resizeObserver = new ResizeObserver((_entries) => {
            this.recalculatePositions();
        });
        resizeObserver.observe(canvas);
        this.recalculatePositions();
    }

    clearEvents() {
        this.abortController.abort();
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

    startTicking() {
        if (!this.isTicking) {
            this.isTicking = true;
            this.lastTick = performance.now();
            this.tick();
        }
    }

    tick() {
        const currentTime = performance.now();

        this.process(Math.min((currentTime - this.lastTick) / 1000, 0.1));
        this.render();

        this.lastTick = currentTime;

        // only redo when necessary
        requestAnimationFrame(() => {
            if (this.particles.length) {
                this.tick();
            } else {
                this.isTicking = false;
            }
        });
    }

    process(deltaTime: number) {
        //! This function has side effects, but doing this without filter() is very clunky
        this.particles = this.particleQueue.concat(
            this.particles.filter((particle) => !particle.process(this, deltaTime)),
        );
        this.particleQueue = [];
    }

    render() {
        this.draw.clearRect(0, 0, this.sizeInfo.width, this.sizeInfo.height);

        for (const particle of this.particles) {
            particle.draw(this);
        }
    }

    spawnParticle(particle: Particle) {
        this.particleQueue.push(particle);
        this.startTicking();
    }
}
