import { Particle, BaseEffectContext } from "./BaseContext";
import spriteImage from "~/assets/objects.png";

let baseImage: HTMLImageElement | undefined = undefined;
export function getBaseImage() {
    if (!baseImage) {
        baseImage = new Image();
        baseImage.src = spriteImage;
    }
    return baseImage;
}

export interface SpriteParticleSettings<T = {}> {
    // (0, 0) - tl corner, (1, 1) - br corner
    x: number;
    y: number;

    // point on image that (x, y) refers to
    originX: number;
    originY: number;

    imageX: number;
    imageY: number;
    imageWidth: number;
    imageHeight: number;
    scale: number;
    animFrames: number;
    frameInterval: number;

    storage: T;
    processFunc: (
        self: SpriteParticle<T>,
        context: BaseEffectContext,
        deltaTime: number,
    ) => boolean;
}

export class SpriteParticle<T = {}> extends Particle {
    x: number;
    y: number;

    originX: number;
    originY: number;

    imageX: number;
    imageY: number;
    imageWidth: number;
    imageHeight: number;
    scale: number;
    animFrames: number;
    frameInterval: number;

    storage: T;
    processFunc: (
        self: SpriteParticle<T>,
        context: BaseEffectContext,
        deltaTime: number,
    ) => boolean;
    age: number;

    constructor(settings: SpriteParticleSettings<T>) {
        super();
        this.x = settings.x;
        this.y = settings.y;
        this.originX = settings.originX;
        this.originY = settings.originY;
        this.imageX = settings.imageX;
        this.imageY = settings.imageY;
        this.imageWidth = settings.imageWidth;
        this.imageHeight = settings.imageHeight;
        this.scale = settings.scale;
        this.animFrames = settings.animFrames;
        this.frameInterval = settings.frameInterval;
        this.processFunc = settings.processFunc;

        this.storage = settings.storage;
        this.age = 0;
    }

    private getCurrentFrame() {
        return Math.floor(this.age / this.frameInterval) % this.animFrames;
    }

    process(context: BaseEffectContext, deltaTime: number) {
        this.age += deltaTime;
        return this.processFunc(this, context, deltaTime);
    }

    draw(context: BaseEffectContext) {
        context.draw.imageSmoothingEnabled = false;
        context.draw.drawImage(
            getBaseImage(),
            this.imageX + this.getCurrentFrame() * this.imageWidth,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            Math.round(this.x * context.sizeInfo.width - this.originX * this.scale),
            Math.round(this.y * context.sizeInfo.height - this.originY * this.scale),
            this.imageWidth * this.scale,
            this.imageHeight * this.scale,
        );
    }
}
