import AdminFly from "@/AdminSystem/AdminFly";
import { _control_ids } from "@/Constants/Constants";
import distBetweenCoords from "@/PlayerMethods/distanceBetweenCoords";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import weaponDamageValues from './WeaponDamageData';
import VehicleManager from "@/VehicleSystems/VehicleManager";

export default class NewAntiCheatSystem {
    private static LocalPlayer: PlayerMp = mp.players.local;
    private static lastCheckPosition: Vector3 = mp.players.local.position;
    private static readonly adminAlertRemoteEvent: string = "server:anticheat:alertAdmins";
    public static clientFps: number;
    public static lastFrameCount: number;
    public static acActive: boolean = true;
    public static lastHpVal: number = NewAntiCheatSystem.LocalPlayer.getHealth() + NewAntiCheatSystem.LocalPlayer.getArmour();
    public static readonly aircraftClasses: number[] = [15, 16];
    public static readonly allowedToWhip: number[] = [mp.game.joaat("WEAPON_UNARMED"), mp.game.joaat("WEAPON_NIGHSTICK")];
    public static playerCamera: CameraMp = mp.cameras.new("gameplay");
    public static groundZCheck: number;
    public static isReloadingWeapon: boolean;
    public static enteringVehHandle: number;
    public static pointingAtRemoteId: number;
    public static bulletsShot: number;

    constructor() {
        mp.events.add("render", () => {
            NewAntiCheatSystem.setVehicleEnterHandle();
            NewAntiCheatSystem.createForwardFacingRaycast();
            NewAntiCheatSystem.disablePistolWhip();
        });

        mp.events.add({
            "playerWeaponShot": NewAntiCheatSystem.handleWeaponShot,
            "outgoingDamage": NewAntiCheatSystem.handleOutgoingDamage,
            "incomingDamage": NewAntiCheatSystem.handleIncomingDamage,
            "playerEnterVehicle": NewAntiCheatSystem.handleEnterVehicle,
            "playerLeaveVehicle": NewAntiCheatSystem.handleLeaveVehicle,
            "entityStreamIn": NewAntiCheatSystem.checkForIllegalVeh,
            "client:ac:sleepClient": NewAntiCheatSystem.handleSleep
        });

        setInterval(() => {
            NewAntiCheatSystem.handlePositionCheck();
            NewAntiCheatSystem.checkForCarFly();
            NewAntiCheatSystem.checkSpeed();
            NewAntiCheatSystem.checkForHealthKey();
        }, 4000);

        setInterval(() => {
            NewAntiCheatSystem.bulletsShot = 0;
            NewAntiCheatSystem.clientFps = NewAntiCheatSystem.getFrameCount() - NewAntiCheatSystem.lastFrameCount;
            NewAntiCheatSystem.LocalPlayer.fps = NewAntiCheatSystem.clientFps;
            NewAntiCheatSystem.lastFrameCount = NewAntiCheatSystem.getFrameCount();
        }, 1000);

        mp.keys.bind(_control_ids.RELOADBIND, false, NewAntiCheatSystem.handleReloadCheck);
    }

    private static handleLeaveVehicle(vehicle: VehicleMp) {
        NewAntiCheatSystem.lastCheckPosition = NewAntiCheatSystem.LocalPlayer.position;
    }

    private static createForwardFacingRaycast() {
        let position: Vector3 = NewAntiCheatSystem.playerCamera.getCoord();
        let direction: Vector3 = NewAntiCheatSystem.playerCamera.getDirection();

        let farAway: Vector3 = new mp.Vector3((direction.x * 250) + (position.x), (direction.y * 250) + (position.y), (direction.z * 250) + (position.z));

        let getHittingData: RaycastResult = mp.raycasting.testPointToPoint(position, farAway, NewAntiCheatSystem.LocalPlayer);

        if (getHittingData && getHittingData.entity && (getHittingData.entity as PlayerMp).remoteId !== undefined) {
            NewAntiCheatSystem.pointingAtRemoteId = (getHittingData.entity as PlayerMp).remoteId;
            return;
        }

        NewAntiCheatSystem.pointingAtRemoteId = -1;
    }

    private static disablePistolWhip() {
        if (NewAntiCheatSystem.allowedToWhip.indexOf(NewAntiCheatSystem.LocalPlayer.weapon) !== -1 && NewAntiCheatSystem.LocalPlayer.getAmmoInClip(NewAntiCheatSystem.LocalPlayer.weapon) === 0) return;

        mp.game.controls.disableControlAction(1, 140, true);
        mp.game.controls.disableControlAction(1, 141, true);
        mp.game.controls.disableControlAction(1, 142, true);
    }

    private static checkForIllegalVeh(entity: EntityMp) {
        if (entity.type !== "vehicle") return;

        if (entity.remoteId === 65535 && VehicleManager.spawnedVehicles.indexOf(entity as VehicleMp) === -1) {
            let plate = (entity as VehicleMp).getNumberPlateText();

            NewAntiCheatSystem.adminAlert(AcEvents.vehicleSpawnHack, plate);

            entity.destroy();
        }
    }

    private static handleEnterVehicle(vehicle: VehicleMp) {
        if (!vehicle || vehicle.handle === 0) return;

        NewAntiCheatSystem.checkForIllegalVeh(vehicle as VehicleMp);

        if (vehicle.handle !== NewAntiCheatSystem.enteringVehHandle) {
            let enteredPlateFromHandle = NewAntiCheatSystem.enteringVehHandle ? NewAntiCheatSystem.enteringVehHandle : vehicle.handle;
            let plate: string = "N/A";

            let veh: VehicleMp = mp.vehicles.atHandle(enteredPlateFromHandle);

            if (veh) plate = veh.getNumberPlateText();

            NewAntiCheatSystem.adminAlert(AcEvents.tpToVehicle, plate);
        }
    }

    private static setVehicleEnterHandle() {
        let enteringVehHandle: number = NewAntiCheatSystem.LocalPlayer.getVehicleIsTryingToEnter();

        if (enteringVehHandle !== 0) {
            NewAntiCheatSystem.enteringVehHandle = enteringVehHandle;
        }
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

    private static checkSpeed() {
        if (!NewAntiCheatSystem.LocalPlayer.vehicle) return;

        if (NewAntiCheatSystem.aircraftClasses.indexOf(NewAntiCheatSystem.LocalPlayer.vehicle.getClass()) !== -1) return;

        let currentSpeed: number = NewAntiCheatSystem.LocalPlayer.vehicle.getSpeed();
        let maxSpeed: number = mp.game.vehicle.getVehicleModelMaxSpeed(NewAntiCheatSystem.LocalPlayer.vehicle.model) + 10;

        if (currentSpeed > maxSpeed) NewAntiCheatSystem.adminAlert(AcEvents.vehicleSpeedHack, `${Math.round(currentSpeed * 3.6)}kmh max speed is ${Math.round(maxSpeed * 3.6)}kmh`);
    }

    private static adminAlert(event: AcEvents, otherVal: any = "null") {
        if (!NewAntiCheatSystem.acActive) return;

        mp.events.callRemote(NewAntiCheatSystem.adminAlertRemoteEvent, event, NewAntiCheatSystem.clientFps, otherVal + "");
    }

    private static checkForHealthKey() {
        let checkHp: number = NewAntiCheatSystem.lastHpVal;
        let newHp: number = NewAntiCheatSystem.LocalPlayer.getHealth() + NewAntiCheatSystem.LocalPlayer.getArmour();

        if (newHp > checkHp || newHp > 200 || checkHp > 200) {
            NewAntiCheatSystem.adminAlert(AcEvents.healthKey, newHp - checkHp);
        }

        NewAntiCheatSystem.lastHpVal = newHp;
    }

    private static async handlePositionCheck() {
        if (AdminFly.flyEnabled || NewAntiCheatSystem.LocalPlayer.vehicle) NewAntiCheatSystem.lastCheckPosition = NewAntiCheatSystem.LocalPlayer.position;

        if (Math.round(NewAntiCheatSystem.LocalPlayer.getSpeed()) > 9 && !NewAntiCheatSystem.LocalPlayer.vehicle && !NewAntiCheatSystem.LocalPlayer.isOnVehicle()) {
            NewAntiCheatSystem.adminAlert(AcEvents.playerSpeedHack, Math.round(NewAntiCheatSystem.LocalPlayer.getSpeed()));
        }

        let lastPosDifX: number = Math.abs(NewAntiCheatSystem.LocalPlayer.position.subtract(NewAntiCheatSystem.lastCheckPosition).x);
        let lastPosDifY: number = Math.abs(NewAntiCheatSystem.LocalPlayer.position.subtract(NewAntiCheatSystem.lastCheckPosition).y);

        if ((lastPosDifX > 30 || lastPosDifY > 30) && !AdminFly.flyEnabled && !NewAntiCheatSystem.LocalPlayer.isOnVehicle()) {
            NewAntiCheatSystem.adminAlert(AcEvents.teleportHack, Math.round(lastPosDifY + lastPosDifX));
        }

        NewAntiCheatSystem.lastCheckPosition = NewAntiCheatSystem.LocalPlayer.position;
    }

    private static handleWeaponShot() {
        NewAntiCheatSystem.bulletsShot++;

        let ammoInClip: number = NewAntiCheatSystem.LocalPlayer.getAmmoInClip(NewAntiCheatSystem.LocalPlayer.weapon);
        let maxAmmoForGun: number = mp.game.weapon.getWeaponClipSize(NewAntiCheatSystem.LocalPlayer.weapon);

        if (NewAntiCheatSystem.isReloadingWeapon) {
            NewAntiCheatSystem.adminAlert(AcEvents.noReloadHack, ammoInClip);
        }

        if (ammoInClip > maxAmmoForGun) {
            NewAntiCheatSystem.adminAlert(AcEvents.weaponAmmoHack, `${ammoInClip} in clip and max for gun ${maxAmmoForGun} dif (${ammoInClip - maxAmmoForGun})`);
        }

        if (NewAntiCheatSystem.bulletsShot > 10) {
            NewAntiCheatSystem.adminAlert(AcEvents.firerateHack, NewAntiCheatSystem.bulletsShot);
        }
    }

    private static handleOutgoingDamage(sourceEntity: EntityMp, targetEntity: EntityMp, sourcePlayer: PlayerMp, weapon: number, boneIndex: number, damage: number): boolean {
        if (targetEntity.type !== "player" || sourcePlayer.handle !== NewAntiCheatSystem.LocalPlayer.handle) return false;

        if (NewAntiCheatSystem.pointingAtRemoteId !== targetEntity.remoteId) {
            NewAntiCheatSystem.adminAlert(AcEvents.magicBullet, distBetweenCoords(NewAntiCheatSystem.LocalPlayer.position, targetEntity.position));
            return true;
        }

        return false;
    }

    private static handleIncomingDamage(sourceEntity: EntityMp, sourcePlayer: PlayerMp, targetEntity: EntityMp, weapon: number, boneIndex: number, damage: number) {
        if (targetEntity.type !== "player" || !sourcePlayer) return;

        let oldHealth: number = NewAntiCheatSystem.getAcHealth(targetEntity as PlayerMp);

        let max: number = 85;
        let min: number = 60;

        const weaponGroupHash: number = mp.game.weapon.getWeapontypeGroup(weapon);

        if (weapon in weaponDamageValues.damageWeapons) {
            max = weaponDamageValues.damageWeapons[weapon].max;
            min = weaponDamageValues.damageWeapons[weapon].min;
        } else if (weaponGroupHash in weaponDamageValues.damageWeaponGroups) {
            max = weaponDamageValues.damageWeaponGroups[weaponGroupHash].max;
            min = weaponDamageValues.damageWeaponGroups[weaponGroupHash].min;
        }

        const percent: number = (Math.random() * (max - min) + min) / 100;
        let customDamage: any = damage - (damage * percent);

        if (boneIndex === 20) {
            customDamage /= 10;
        }

        (targetEntity as PlayerMp).applyDamageTo(parseInt(customDamage), true);

        const currentHealth: number = targetEntity.getHealth();
        let newHealth: number = NewAntiCheatSystem.getAcHealth(targetEntity as PlayerMp);

        if (oldHealth === newHealth && targetEntity.handle === NewAntiCheatSystem.LocalPlayer.handle) {
            NewAntiCheatSystem.adminAlert(AcEvents.godModeCheat, newHealth);
        }

        if (currentHealth > 0) {
            mp.game.weapon.setCurrentDamageEventAmount(0);
        }
    }


    private static handleReloadCheck() {
        if (getUserCharacterData() == null || !NewAntiCheatSystem.LocalPlayer.isReloading()) return;

        NewAntiCheatSystem.isReloadingWeapon = true;

        setTimeout(() => {
            NewAntiCheatSystem.isReloadingWeapon = false;
        }, 1100);
    }

    private static getFrameCount(): number {
        return mp.game.invoke("0xFC8202EFC642E6F2");
    }

    private static getAcHealth(player: PlayerMp): number {
        return player.getHealth() + player.getArmour();
    }

    private static handleSleep(time: number) {
        NewAntiCheatSystem.acActive = false;

        setTimeout(() => {
            NewAntiCheatSystem.acActive = true;
            NewAntiCheatSystem.lastCheckPosition = NewAntiCheatSystem.LocalPlayer.position;
            NewAntiCheatSystem.lastHpVal = NewAntiCheatSystem.LocalPlayer.getHealth() + NewAntiCheatSystem.LocalPlayer.getArmour();
        }, time);
    }
}

enum AcEvents {
    teleportHack,
    disallowedWeapon,
    healthKey,
    carFly,
    vehicleSpeedHack,
    noReloadHack,
    dimensionChangeHack,
    vehicleSpawnHack,
    vehicleUnlockHack,
    weaponAmmoHack,
    playerSpeedHack,
    tpToVehicle,
    magicBullet,
    firerateHack,
    godModeCheat
}