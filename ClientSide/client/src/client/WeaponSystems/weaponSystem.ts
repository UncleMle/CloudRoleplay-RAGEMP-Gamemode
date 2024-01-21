import { UserData } from "@/@types";
import getTargetData from "@/PlayerMethods/getTargetData";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import getUserData from "@/PlayerMethods/getUserData";

export default class WeaponSystem {
    public static LocalPlayer: PlayerMp;
    public static _switchAnimIdentifer: string = "weaponSwitchAnim";

    constructor() {
        WeaponSystem.LocalPlayer = mp.players.local;

        mp.events.add("entityStreamIn", WeaponSystem.handleStreamIn);
        mp.events.add("render", WeaponSystem.handleRender);

        mp.events.addDataHandler(WeaponSystem._switchAnimIdentifer, WeaponSystem.handleDataHandler);
    }

    public static handleRender() {
        let userData: UserData | undefined = getUserData();

        if(WeaponSystem.LocalPlayer.vehicle && WeaponSystem.LocalPlayer.vehicle.getPedInSeat(-1) == WeaponSystem.LocalPlayer.handle) {
            WeaponSystem.disableGunShooting();
        }
    }

    public static handleStreamIn(entity: PlayerMp) {
        if(entity.type != "player") return;

        if(entity.getVariable(WeaponSystem._switchAnimIdentifer)) {
            WeaponSystem.playSwitchAnim(entity);
        }
    }

    public static handleDataHandler(entity: PlayerMp, data: boolean) {
        if(entity.type == "player" && data) {
            WeaponSystem.playSwitchAnim(entity);
        }
    }

    public static async playSwitchAnim(player: PlayerMp) {
        mp.game.streaming.requestAnimDict('reaction@intimidation@1h')
        player.taskPlayAnim('reaction@intimidation@1h', 'intro', 8.0, 1.0, 1110.0, 0 + 32 + 16, 0.0, false, false, false)
    }

    public static disableGunShooting() {
        mp.game.controls.disableControlAction(1, 25, true);
        mp.game.controls.disableControlAction(1, 67, true);
        mp.game.controls.disableControlAction(1, 114, true);
        mp.game.controls.disableControlAction(1, 68, true);
        mp.game.controls.disableControlAction(0, 24, true);
        mp.game.controls.disableControlAction(0, 69, true);
        mp.game.controls.disableControlAction(0, 70, true);
        mp.game.controls.disableControlAction(0, 92, true);
        mp.game.controls.disableControlAction(0, 140, true);
        mp.game.controls.disableControlAction(0, 141, true);
        mp.game.controls.disableControlAction(0, 142, true);
        mp.game.controls.disableControlAction(0, 257, true);
        mp.game.controls.disableControlAction(0, 263, true);
        mp.game.controls.disableControlAction(0, 265, true);
        mp.game.controls.disableControlAction(0, 68, true);
        mp.game.controls.disableControlAction(0, 70, true);
    }
}