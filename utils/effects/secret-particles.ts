import { SpriteParticle, type SpriteParticleSettings } from "./SpriteParticle";

export const SECRET_PARTICLES = {
    jet: (): SpriteParticleSettings => ({
        x: 1,
        y: Math.random() * 0.8 + 0.1,
        originX: 0,
        originY: 4,
        imageX: 0,
        imageY: 0,
        imageWidth: 20,
        imageHeight: 9,
        scale: 3,
        animFrames: 2,
        frameInterval: 0.05,
        storage: {},
        processFunc(self, _context, deltaTime) {
            if (self.x < -0.5) {
                return true;
            }
            self.x -= deltaTime / 6;
            self.y += Math.sin(self.age * 2 * Math.PI) * 0.00005;

            return false;
        },
    }),
    marilda: (): SpriteParticleSettings => ({
        x: Math.random() * 0.8 + 0.1,
        y: 1,
        originX: 7,
        originY: 0,
        imageX: 0,
        imageY: 9,
        imageWidth: 15,
        imageHeight: 27,
        scale: 3,
        animFrames: 4,
        frameInterval: 0.05,
        storage: {},
        processFunc(self, _context, deltaTime) {
            if (self.y < -0.5) {
                return true;
            }
            self.y -= deltaTime / 3;
            self.x += Math.sin(self.age * 2 * Math.PI) * 0.0002;

            return false;
        },
    }),
    gopher: (): SpriteParticleSettings<{ vx: number; vy: number }> => {
        let pos: { x: number; y: number };
        let velocity: { vx: number; vy: number };
        if (Math.random() < 0.5) {
            // vertical
            if (Math.random() < 0.5) {
                // top
                pos = {
                    x: Math.random() * 0.8 + 0.1,
                    y: -0.1,
                };
                velocity = {
                    vx: 0,
                    vy: 1,
                };
            } else {
                // bottom
                pos = {
                    x: Math.random() * 0.8 + 0.1,
                    y: 1.1,
                };
                velocity = {
                    vx: 0,
                    vy: -1,
                };
            }
        } else {
            // horizontal
            if (Math.random() < 0.5) {
                // left
                pos = {
                    x: -0.1,
                    y: Math.random() * 0.8 + 0.1,
                };
                velocity = {
                    vx: 1.1,
                    vy: 0,
                };
            } else {
                // right
                pos = {
                    x: 1,
                    y: Math.random() * 0.8 + 0.1,
                };
                velocity = {
                    vx: -1,
                    vy: 0,
                };
            }
        }

        return {
            ...pos,
            originX: 8,
            originY: 8,
            imageX: 0,
            imageY: 36,
            imageWidth: 16,
            imageHeight: 16,
            scale: 3,
            animFrames: 4,
            frameInterval: 0.2,
            storage: velocity,
            processFunc(self, _context, deltaTime) {
                if (self.x < -0.5 || self.y < -0.5 || self.x > 1.5 || self.y > 1.5) {
                    return true;
                }
                self.x += self.storage.vx * deltaTime * 0.3;
                self.y += self.storage.vy * deltaTime * 0.3;

                return false;
            },
        };
    },
    seaMonster: (): SpriteParticleSettings => ({
        x: Math.random() * 0.8 + 0.1,
        y: 0,
        originX: 8,
        originY: 16,
        imageX: 0,
        imageY: 52,
        imageWidth: 16,
        imageHeight: 16,
        scale: 3,
        animFrames: 2,
        frameInterval: 0.25,
        storage: {},
        processFunc(self, _context, deltaTime) {
            if (self.y > 1.5) {
                return true;
            }
            self.y += deltaTime / 8;

            return false;
        },
    }),
    qiPlane: (): SpriteParticleSettings<{
        lastSpawnAttempt: number;
        lastMysteryBoxSpawn: number;
    }> => ({
        x: 0,
        y: Math.random() * 0.1 + 0.1,
        originX: 83,
        originY: 21,
        imageX: 64,
        imageY: 0,
        imageWidth: 83,
        imageHeight: 42,
        scale: 3,
        animFrames: 3,
        frameInterval: 0.03,
        storage: {
            lastSpawnAttempt: performance.now(),
            lastMysteryBoxSpawn: performance.now(),
        },
        processFunc(self, context, deltaTime) {
            if (self.x > 1.5) {
                return true;
            }
            self.x += deltaTime / 8;
            self.y += Math.sin(self.age * 0.5 * Math.PI) * 0.0001;

            // spawn mystery boxes
            // do not spawn too often
            const now = performance.now();
            if (now - self.storage.lastSpawnAttempt < 50) {
                return false;
            }
            self.storage.lastSpawnAttempt = now;

            const secsSinceLast = (now - self.storage.lastMysteryBoxSpawn) / 1000;
            const spawnProbability = secsSinceLast / 2.5;
            if (Math.random() < spawnProbability) {
                self.storage.lastMysteryBoxSpawn = now;

                const spawnX = self.x - (40 * self.scale) / context.sizeInfo.width;
                const spawnY = self.y + (24 * self.scale) / context.sizeInfo.height;
                if (spawnX > 0 && spawnX < 1) {
                    context.spawnParticle(
                        new SpriteParticle(SECRET_PARTICLES.mysteryBox(spawnX, spawnY)),
                    );
                }
            }

            return false;
        },
    }),
    mysteryBox: (
        x: number = 0.5,
        y: number = 0.5,
    ): SpriteParticleSettings<{ vx: number; vy: number }> => ({
        x,
        y,
        originX: 8,
        originY: 16,
        imageX: 64,
        imageY: 42,
        imageWidth: 16,
        imageHeight: 16,
        scale: 3,
        animFrames: 1,
        frameInterval: 1,
        storage: {
            vx: (Math.sqrt(Math.random() + 0.5) / 5) * Math.sign(Math.random() - 0.5),
            vy: 0,
        },
        processFunc(self, context, deltaTime) {
            if (self.y > 1.5) {
                return true;
            }

            const HALF_WIDTH = (8 * self.scale) / context.sizeInfo.width;

            self.x += self.storage.vx * deltaTime;
            self.y += self.storage.vy * deltaTime;
            self.storage.vy += 0.65 * deltaTime;

            if (self.x - HALF_WIDTH < 0) {
                self.storage.vx = Math.abs(self.storage.vx) * 0.8;
                self.x = 0 + HALF_WIDTH;
            }

            if (self.x + HALF_WIDTH > 1) {
                self.storage.vx = -Math.abs(self.storage.vx) * 0.8;
                self.x = 1 - HALF_WIDTH;
            }

            if (self.age < 5 && self.y > 1) {
                self.storage.vy = -Math.abs(self.storage.vy) * 0.8;
                self.y = 1;
            }

            return false;
        },
    }),
};

export { SpriteParticle, getBaseImage } from "./SpriteParticle";
