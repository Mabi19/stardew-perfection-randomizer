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
                const spawnY = self.y + (16 * self.scale) / context.sizeInfo.height;
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
        y: number = 0,
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
            vx: (Math.sqrt(Math.random() + 0.1) / 6) * Math.sign(Math.random() - 0.5) + 0.05,
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
    luckyPurpleShorts: (): SpriteParticleSettings<{ vx: number; vy: number }> => {
        const angle = Math.random() * 2 * Math.PI;
        const MAX_SCREEN_LEN = Math.SQRT2 / 2;
        return {
            x: 0.5 + Math.cos(angle) * MAX_SCREEN_LEN,
            y: 0.5 + Math.sin(angle) * MAX_SCREEN_LEN,
            originX: 8,
            originY: 8,
            imageX: 80,
            imageY: 42,
            imageWidth: 16,
            imageHeight: 16,
            scale: 3,
            animFrames: 1,
            frameInterval: 1,
            storage: {
                vx: 0,
                vy: 0,
            },
            processFunc(self, context, deltaTime) {
                if (self.age > 15) {
                    return true;
                }

                const targetX = context.mousePos.x;
                const targetY = context.mousePos.y;
                let dx = targetX - self.x;
                let dy = targetY - self.y;
                const len = Math.hypot(dx, dy);
                if (len == 0) {
                    return false;
                }
                dx /= len;
                dy /= len;

                const velLen = Math.hypot(self.storage.vx, self.storage.vy);
                const drag = velLen ** 2 * deltaTime;
                self.storage.vx -= self.storage.vx * drag;
                self.storage.vy -= self.storage.vy * drag;

                // stop following after a while
                if (self.age < 8) {
                    self.storage.vx += dx * 1 * deltaTime;
                    self.storage.vy += dy * 1 * deltaTime;
                } else {
                    self.storage.vx *= 1 + deltaTime ** 1.05;
                    self.storage.vy *= 1 + deltaTime ** 1.05;
                }

                self.x += self.storage.vx * deltaTime;
                self.y += self.storage.vy * deltaTime;

                return false;
            },
        };
    },
};

export const rarePurpleBlobShorts = (): SpriteParticleSettings<{ vx: number; vy: number }> => {
    const speedMult = 1.5 * Math.random() + 0.3;
    const direction = Math.random() * 2 * Math.PI;
    return {
        x: 0.5,
        y: 0.5,
        originX: 8,
        originY: 8,
        imageX: 80,
        imageY: 42,
        imageWidth: 16,
        imageHeight: 16,
        scale: 3,
        animFrames: 1,
        frameInterval: 1,
        storage: {
            vx: 0.5 * Math.cos(direction) * speedMult,
            vy: 0.5 * Math.sin(direction) * speedMult - 0.2,
        },
        processFunc(self, context, deltaTime) {
            const barXPosition = context.challengeFinishPercent;
            const barYPosition = 1.0;

            const dx = barXPosition - this.x;
            // only move down
            const dy = Math.abs(barYPosition - this.y);
            const length = Math.sqrt(dx ** 2 + dy ** 2);
            self.storage.vx = lerp(this.storage.vx, dx / length, 2 * deltaTime);
            self.storage.vy = lerp(this.storage.vy, dy / length, 2 * deltaTime);

            self.x += this.storage.vx * deltaTime;
            self.y += this.storage.vy * deltaTime;

            return this.y > 1.1;
        },
    };
};

export type SecretParticleID = keyof typeof SECRET_PARTICLES;
