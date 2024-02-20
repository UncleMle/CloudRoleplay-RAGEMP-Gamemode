import { UserData } from "@/@types";
import getUserData from "@/PlayerMethods/getUserData";

export default class WeaponSystem {
    public static LocalPlayer: PlayerMp = mp.players.local;

    constructor() {
        WeaponSystem.LocalPlayer = mp.players.local;

        mp.events.add("render", WeaponSystem.handleRender);
    }

    public static handleRender() {
        let userData: UserData | undefined = getUserData();

        if (!userData?.adminDuty && WeaponSystem.LocalPlayer.vehicle && WeaponSystem.LocalPlayer.vehicle.getPedInSeat(-1) == WeaponSystem.LocalPlayer.handle) {
            WeaponSystem.disableGunShooting();
        }
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