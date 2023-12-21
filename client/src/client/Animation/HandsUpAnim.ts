import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

class HandsUp {
    public static hasHandsUp: boolean;
    public static syncEvent: string = "server:anim:startHandsUp";
    public static _handsUpAnimIdentifer: string = "anim:hasHandsUp";

    constructor() {
        mp.keys.bind(_control_ids.X, false, HandsUp.startAnim);

        mp.events.add("entityStreamIn", HandsUp.handleStreamIn);

        mp.events.addDataHandler(HandsUp._handsUpAnimIdentifer, HandsUp.handleDataHandler)
    }

    public static handleStreamIn(entity: PlayerMp) {
        if(entity.type == "player" && entity.getVariable(HandsUp._handsUpAnimIdentifer)) {
            HandsUp.playAnimForPlayer(entity);
        }
    }

    public static handleDataHandler(entity: PlayerMp) {
        if(entity.type == "player") {

            if(entity.getVariable(HandsUp._handsUpAnimIdentifer)) {
                HandsUp.playAnimForPlayer(entity);
            } else {
                entity.clearTasks();
            }
        }
    }

    public static async playAnimForPlayer(player: PlayerMp) {
        for (let i = 0; player.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }

        mp.game.streaming.requestAnimDict(`random@mugging3`);

        player.taskPlayAnim(`random@mugging3`, `handsup_standing_base`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
    }

    public static startAnim() {
        if(validateKeyPress(false, true)) {
            HandsUp.hasHandsUp = !HandsUp.hasHandsUp;
            mp.events.callRemote(HandsUp.syncEvent, HandsUp.hasHandsUp);
        }
    }
}

export default HandsUp;