import { BaseEffectContext } from "./effects/BaseContext";
import { PurpleBlobParticle } from "./effects/PurpleBlobParticle";
import { ConfettiParticle } from "./effects/ConfettiParticle";

export class DashboardEffectContext extends BaseEffectContext {
    finishGoalHook() {
        for (let i = 0; i < 150; i++) {
            this.particles.push(new ConfettiParticle());
        }

        this.startTicking();
    }
}
