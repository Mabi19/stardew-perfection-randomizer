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
            this.particles.push(new ConfettiParticle());
        }

        this.startTicking();
    }
}
