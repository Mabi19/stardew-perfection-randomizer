import { BaseEffectContext } from "./effects/BaseContext";
import { PurpleBlobParticle } from "./effects/PurpleBlobParticle";
import { ConfettiParticle } from "./effects/ConfettiParticle";

export class DashboardEffectContext extends BaseEffectContext {
    finishGoalHook() {
        const amounts = {
            disabled: 0,
            low: 8,
            medium: 15,
            high: 25,
        } as const;

        const count = amounts[this.settings.particles];

        for (let i = 0; i < count; i++) {
            this.particles.push(new PurpleBlobParticle());
        }

        this.startTicking();
    }

    completeHook() {
        const amounts = {
            disabled: 0,
            low: 125,
            medium: 250,
            high: 400,
        } as const;

        const count = amounts[this.settings.particles];

        for (let i = 0; i < count; i++) {
            this.particles.push(ConfettiParticle.randomOfExplosion());
        }

        this.startTicking();
    }

    lastConfettoSpawn = performance.now();

    spawnConstantConfetti() {
        const divisors = {
            disabled: Infinity,
            low: 1.2,
            medium: 0.75,
            high: 0.3,
        } as const;

        const now = performance.now();
        const secsSinceLast = (now - this.lastConfettoSpawn) / 1000;
        const spawnProbability = secsSinceLast / divisors[this.settings.particles];
        if (Math.random() < spawnProbability) {
            this.lastConfettoSpawn = now;

            const x = 0.5 + 0.4 * (Math.random() > 0.5 ? 1 : -1);
            const confetto = new ConfettiParticle(
                x,
                -0.2,
                Math.random() * 0.002 - 0.001,
                0.002 + 0.0003 * Math.random(),
            );
            // hack to make them live longer
            confetto.age = -2;
            this.particles.push(confetto);
            this.startTicking();
        }
    }
}
