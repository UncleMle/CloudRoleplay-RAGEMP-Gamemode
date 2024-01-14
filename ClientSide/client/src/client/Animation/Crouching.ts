import validateKeyPress from "@/PlayerMethods/validateKeyPress";

export default class Crouching {
    public static LocalPlayer: PlayerMp;
    public static readonly remoteEvent: string = "server:anim:toggleCrouching";
    public static readonly movementClipSet: string = "move_ped_crouched";
    public static readonly strafeClipSet: string = "move_ped_crouched_strafing";
    public static readonly _crouchingAnimIdentifier: string = "anim:isCrouching";
    public static readonly clipSetSwitchTime: number = 0.25;

    constructor() {
        Crouching.loadClipSet(Crouching.movementClipSet);
        Crouching.loadClipSet(Crouching.strafeClipSet);

        mp.events.add("entityStreamIn", Crouching.handleStreamIn);
        mp.events.addDataHandler(Crouching._crouchingAnimIdentifier, Crouching.handleDataHandler);

        mp.keys.bind(223, false, Crouching.handleKeyPress);
    }

    private static handleStreamIn(entity: PlayerMp) {
        if (entity.type === "player" && entity.getVariable(Crouching._crouchingAnimIdentifier)) {
            entity.setMovementClipset(Crouching.movementClipSet, Crouching.clipSetSwitchTime);
            entity.setStrafeClipset(Crouching.strafeClipSet);
        }
    }

    private static handleKeyPress() {
        if(validateKeyPress(true, true, true)) {
            mp.events.callRemote(Crouching.remoteEvent);
        }
    }

    private static handleDataHandler(entity: PlayerMp, value: boolean | null) {
        if (entity.type === "player") {
            if (value) {
                entity.setMovementClipset(Crouching.movementClipSet, Crouching.clipSetSwitchTime);
                entity.setStrafeClipset(Crouching.strafeClipSet);
            } else {
                entity.resetMovementClipset(Crouching.clipSetSwitchTime);
                entity.resetStrafeClipset();
            }
        }
    }

    private static loadClipSet(clipSetName: string) {
        mp.game.streaming.requestClipSet(clipSetName);
        while (!mp.game.streaming.hasClipSetLoaded(clipSetName)) mp.game.wait(0);
    };
}