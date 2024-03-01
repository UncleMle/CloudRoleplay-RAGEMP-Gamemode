import AdminFly from "@/AdminSystem/AdminFly";
import { _control_ids } from "@/Constants/Constants";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";

export default class NewAntiCheatSystem {
    private static LocalPlayer: PlayerMp = mp.players.local;
    private static lastCheckPosition: Vector3 = mp.players.local.position;
    private static readonly adminAlertRemoteEvent: string = "server:anticheat:alertAdmins";
    public static clientFps: number;
    public static lastFrameCount: number;
    public static acActive: boolean = true;
    public static lastHpVal: number = NewAntiCheatSystem.LocalPlayer.getHealth() + NewAntiCheatSystem.LocalPlayer.getArmour();
    public static readonly aircraftClasses: number[] = [15, 16];
    public static groundZCheck: number;
    public static isReloadingWeapon: boolean;

    constructor() {
        mp.events.add({
            "playerWeaponShot": NewAntiCheatSystem.handleWeaponShot,
            "client:ac:sleepClient": NewAntiCheatSystem.handleSleep
        });

        setInterval(() => {
            NewAntiCheatSystem.handlePositionCheck();
            NewAntiCheatSystem.checkForCarFly();
            NewAntiCheatSystem.checkSpeed();
            NewAntiCheatSystem.checkForHealthKey();
        }, 4000);

        setInterval(() => {
            NewAntiCheatSystem.clientFps = NewAntiCheatSystem.getFrameCount() - NewAntiCheatSystem.lastFrameCount;
            NewAntiCheatSystem.LocalPlayer.fps = NewAntiCheatSystem.clientFps;
            NewAntiCheatSystem.lastFrameCount = NewAntiCheatSystem.getFrameCount();
        }, 1000);

        mp.keys.bind(_control_ids.RELOADBIND, false, NewAntiCheatSystem.handleReloadCheck);
    }

    private static checkForCarFly(height: number = 50) {
        if (!NewAntiCheatSystem.LocalPlayer.vehicle) return;

        if (NewAntiCheatSystem.aircraftClasses.indexOf(NewAntiCheatSystem.LocalPlayer.vehicle.getClass()) !== -1) return;

        let vehPos: Vector3 = NewAntiCheatSystem.LocalPlayer.vehicle.position;

        NewAntiCheatSystem.groundZCheck = mp.game.gameplay.getGroundZFor3dCoord(vehPos.x, vehPos.y, vehPos.z, false, false);

        let posDif: number = vehPos.z - NewAntiCheatSystem.groundZCheck;

        if (vehPos.z - NewAntiCheatSystem.groundZCheck > height + NewAntiCheatSystem.groundZCheck) {
            NewAntiCheatSystem.adminAlert(AcEvents.carFly, posDif);
        }
    }

    private static checkSpeed(maxSpeed: number = 260) {
        if (!NewAntiCheatSystem.LocalPlayer.vehicle) return;

        if (NewAntiCheatSystem.aircraftClasses.indexOf(NewAntiCheatSystem.LocalPlayer.vehicle.getClass()) !== -1) return;

        let currentSpeed: number = NewAntiCheatSystem.LocalPlayer.vehicle.getSpeed() * 3.6;

        if (currentSpeed > maxSpeed) NewAntiCheatSystem.adminAlert(AcEvents.vehicleSpeedHack, Math.round(currentSpeed));
    }

    private static adminAlert(event: AcEvents, otherVal: any = "null") {
        if (!NewAntiCheatSystem.acActive) return;

        mp.events.callRemote(NewAntiCheatSystem.adminAlertRemoteEvent, event, NewAntiCheatSystem.clientFps, otherVal + "");
    }

    private static checkForHealthKey() {
        let checkHp: number = NewAntiCheatSystem.lastHpVal;
        let newHp: number = NewAntiCheatSystem.LocalPlayer.getHealth() + NewAntiCheatSystem.LocalPlayer.getArmour();

        if (newHp > checkHp) {
            NewAntiCheatSystem.adminAlert(AcEvents.healthKey, newHp - checkHp);
        }

        NewAntiCheatSystem.lastHpVal = newHp;
    }

    private static async handlePositionCheck() {
        if (AdminFly.flyEnabled || NewAntiCheatSystem.LocalPlayer.vehicle) NewAntiCheatSystem.lastCheckPosition = NewAntiCheatSystem.LocalPlayer.position;

        let lastPosDifX: number = Math.abs(NewAntiCheatSystem.LocalPlayer.position.subtract(NewAntiCheatSystem.lastCheckPosition).x);
        let lastPosDifY: number = Math.abs(NewAntiCheatSystem.LocalPlayer.position.subtract(NewAntiCheatSystem.lastCheckPosition).y);

        if ((lastPosDifX > 30 || lastPosDifY > 30) && !AdminFly.flyEnabled) {
            NewAntiCheatSystem.adminAlert(AcEvents.teleportHack, Math.round(lastPosDifY + lastPosDifX));
        }

        NewAntiCheatSystem.lastCheckPosition = NewAntiCheatSystem.LocalPlayer.position;
    }

    private static handleWeaponShot() {
        let ammoInClip: number = NewAntiCheatSystem.LocalPlayer.getAmmoInClip(NewAntiCheatSystem.LocalPlayer.weapon);

        if (NewAntiCheatSystem.isReloadingWeapon) {
            NewAntiCheatSystem.adminAlert(AcEvents.noReloadHack, ammoInClip);
        }
    }

    private static handleReloadCheck() {
        if (getUserCharacterData() == null || !NewAntiCheatSystem.LocalPlayer.isReloading()) return;

        NewAntiCheatSystem.isReloadingWeapon = true;

        setTimeout(() => {
            NewAntiCheatSystem.isReloadingWeapon = false;
        }, 1100);
    }

    private static getFrameCount() {
        return mp.game.invoke("0xFC8202EFC642E6F2");
    }

    private static handleSleep(time: number) {
        NewAntiCheatSystem.acActive = false;

        setTimeout(() => {
            NewAntiCheatSystem.acActive = true;
        }, time);
    }
}

enum AcEvents {
    teleportHack,
    disallowedWeapon,
    healthKey,
    carFly,
    vehicleSpeedHack,
    noReloadHack
}