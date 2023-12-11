import { BaseEffectContext } from "./effects/BaseContext";
import { PurpleBlobParticle } from "./effects/PurpleBlobParticle";
import { ConfettiParticle } from "./effects/ConfettiParticle";

export class DashboardEffectContext extends BaseEffectContext {
    finishGoalHook() {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new PurpleBlobParticle());
        }

        this.startTicking();
    }

    completeHook() {
        for (let i = 0; i < 250; i++) {
            this.particles.push(new ConfettiParticle());
        }

        this.startTicking();
    }
}
