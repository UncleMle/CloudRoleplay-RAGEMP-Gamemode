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

    private static handleDataHandler(entity: PlayerMp, anim: AnimationData) {
        if (!anim || entity.type != "player") return;
        AnimationSync.playAnimation(entity, anim);
    }

    private static playAnimation(entity: PlayerMp, anim: AnimationData) {
        entity.taskPlayAnim(anim.animName, anim.propName, 8.0, 1.0, -1, anim.flag, 1.0, false, false, false);
    }
}