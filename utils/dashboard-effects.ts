import { BaseEffectContext } from "./effects/BaseContext";
import { PurpleBlobParticle } from "./effects/PurpleBlobParticle";

export class DashboardEffectContext extends BaseEffectContext {
    finishGoalHook() {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new PurpleBlobParticle());
        }

        this.startTicking();
    }
}
