import { AnimationData } from "@/@types";

export default class AnimationSync {
    public static readonly _animationDataKey: string = "player:animationData:key";

    constructor() {
        mp.events.add("entityStreamIn", AnimationSync.handleStreamIn);
        mp.events.addDataHandler(AnimationSync._animationDataKey, AnimationSync.handleDataHandler);
    }

    private static handleStreamIn(entity: PlayerMp) {
        let animData: AnimationData = entity.getVariable(AnimationSync._animationDataKey);

        if (animData && entity.type === "player") {
            AnimationSync.playAnimation(entity, animData);
        }
    }

    private static handleDataHandler(entity: PlayerMp, value: AnimationData | null, oldValue: AnimationData) {
        if (entity.type != "player") return;
        AnimationSync.playAnimation(entity, value, oldValue);
    }

    private static async playAnimation(entity: PlayerMp, anim: AnimationData | null, old: AnimationData | null = null) {
        if (anim) {
            mp.game.streaming.requestAnimDict(anim.dict);

            await mp.game.waitAsync(100);

            entity.taskPlayAnim(anim.dict, anim.anim, 1.0, 1.0, -1, 0 + 32 + 16, 0.0, false, false, false)
            entity.setDynamic(true);
            return;
        }

        if (!old) return;

        entity.stopAnimTask(old.dict, old.anim, parseInt(old.flag));
    }
}