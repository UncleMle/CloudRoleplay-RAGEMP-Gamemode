import { _control_ids } from "@/Constants/Constants";
import NotificationSystem from "@/NotificationSystem/NotificationSystem";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import VehicleSystems from "@/VehicleSystems/VehicleSystem";
import WeaponSystem from "@/WeaponSystems/weaponSystem";

export default class HandsUp {
    public static LocalPlayer: PlayerMp;
    public static hasHandsUp: boolean;
    public static syncEvent: string = "server:anim:startHandsUp";
    public static _handsUpAnimIdentifer: string = "anim:hasHandsUp";

    constructor() {
        HandsUp.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.X, false, HandsUp.startAnim);

        mp.events.add("entityStreamIn", HandsUp.handleStreamIn);
        mp.events.add("playerEnterVehicle", HandsUp.handleVehEnter);
        mp.events.add("render", HandsUp.handleRender);

        mp.events.addDataHandler(HandsUp._handsUpAnimIdentifer, HandsUp.handleDataHandler)
    }

    public static handleVehEnter() {
        if(HandsUp.hasHandsUp) {
            HandsUp.hasHandsUp = false;
            mp.events.callRemote(HandsUp.syncEvent, false);
        }
    }

    public static handleRender() {
        if(HandsUp.LocalPlayer.getVariable(HandsUp._handsUpAnimIdentifer)) {
            WeaponSystem.disableGunShooting();

            if(HandsUp.LocalPlayer.vehicle && HandsUp.LocalPlayer.vehicle.getPedInSeat(-1) == HandsUp.LocalPlayer.handle) {
                HandsUp.LocalPlayer.vehicle.setUndriveable(true);
                VehicleSystems.disableControls();
            }
        }
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
        if(validateKeyPress(true, true, true) && HandsUp.LocalPlayer.browserRouter == "/") {

            if(HandsUp.LocalPlayer._fuelNozzleObject) {
                NotificationSystem.createNotification("~r~You can't do this whilst refuelling", false);
                return;
            }

            HandsUp.hasHandsUp = !HandsUp.hasHandsUp;
            mp.events.callRemote(HandsUp.syncEvent, HandsUp.hasHandsUp);
        }
    }
}