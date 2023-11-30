import { SubtractVector } from "../@types";
import { _control_ids } from "../Constants/Constants";

class AntiCheat {
	public static LocalPlayer: PlayerMp;
	public static active: boolean;
	public static flags: number;
	public static hits: number;
	public static reloadingWeapon: boolean;
	public static position: Vector3;
	public static health: number;
	public static weapon: number;
	public static magazine: number;
	public static firstShot: boolean;
	public static range_to_btm: number;
	public static blockedVehicleClasses: number[] = [16, 15];
	public static blockedHashes: number[] = [1119849093, -1312131151, -1355376991, 1198256469, 1834241177, -1238556825, -1568386805, -1312131151, 125959754, 1672152130];
	public static loop: number;
	public static detectionEvent: string = "server:CheatDetection";

	constructor() {
		AntiCheat.LocalPlayer = mp.players.local;
		AntiCheat.active = true;
		AntiCheat.loop = AntiCheat.secs();
		AntiCheat.flags = 0;
		AntiCheat.hits = 0;
		AntiCheat.reloadingWeapon = false;
		AntiCheat.position = AntiCheat.LocalPlayer.position;
		AntiCheat.health = Number(mp.players.local.getHealth()) + Number(mp.players.local.getArmour());
		AntiCheat.weapon = mp.game.invoke(`0x0A6DB4965674D243`, mp.players.local.handle);
		AntiCheat.magazine = mp.game.weapon.getWeaponClipSize(AntiCheat.weapon);
		AntiCheat.firstShot = true;

		mp.events.add("render", AntiCheat.handleRender);
		mp.events.add("client:weaponSwap", AntiCheat.allowWeaponSwitch);
		mp.events.add("playerWeaponShot", AntiCheat.handleWeaponShot);

		mp.keys.bind(_control_ids.RELOADBIND, true, AntiCheat.handleReload);

		setInterval(() => {
			let hp: number = AntiCheat.health;
			setTimeout(() => {
				if (hp < AntiCheat.health && AntiCheat.active) {
					mp.events.callRemote("server:CheatDetection", "Healkey | Unexpected HP added")
				}
			}, 400);
		}, 500);
	}

	public static allowWeaponSwitch() {
		AntiCheat.resetWeapon();
	}

	public static handleWeaponShot() {
		if (AntiCheat.checkWeaponhash()) {
			AntiCheat.alertAdmins(AcExceptions.disallowedWeapon, "Disallowed weapon");
		}
		if (AntiCheat.reloadingWeapon) {
			AntiCheat.alertAdmins(AcExceptions.noReloadHack, "Possible no reload weapon hack");
			AntiCheat.resetWeapon()
		}
		if (AntiCheat.LocalPlayer.getAmmoInClip(AntiCheat.LocalPlayer.weapon) > 70) {
			AntiCheat.alertAdmins(AcExceptions.ammoHack, "Possible ammo clip cheat ammo in clip is " + AntiCheat.LocalPlayer.getAmmoInClip(mp.players.local.weapon));
		}
		AntiCheat.updateMagSize()
	}

	public static handleRender() {
		AntiCheat.health = Number(mp.players.local.getHealth()) + Number(mp.players.local.getArmour());


		if (AntiCheat.loop < AntiCheat.secs()) {
			if (AntiCheat.active) {
				let Difference = AntiCheat.subtractVector(AntiCheat.position, AntiCheat.LocalPlayer.position)
				if (Math.abs(Difference.x) > 30 || Math.abs(Difference.y) > 30) {
					if (AntiCheat.isWalking()) {
						AntiCheat.alertAdmins(AcExceptions.tpHack, "Possible teleport hack");
					}
				}
				if (AntiCheat.LocalPlayer.vehicle && (AntiCheat.checkCarPos(25) || AntiCheat.VehicleFasterThan(250))) {
					AntiCheat.alertAdmins(AcExceptions.vehicleSpeedOrFly, "Possible vehicle fly or speed hack");
				}
			}
			AntiCheat.position = mp.players.local.position
			AntiCheat.loop = AntiCheat.secs() + 3;
		}
	}

	public static handleReload() {
		AntiCheat.reloadingWeapon = true;
		setTimeout(() => {
			AntiCheat.magazine = mp.game.weapon.getWeaponClipSize(mp.game.invoke(`0x0A6DB4965674D243`, mp.players.local.handle));
			AntiCheat.reloadingWeapon = false;
		}, 2000);
	}

	public static sleep(duration: number) {
		AntiCheat.active = false;

		setTimeout(() => {
			AntiCheat.active = true
		}, duration * 1000);
	}

	public static alertAdmins(exception: AcExceptions, message: string) {
		mp.events.callRemote(AntiCheat.detectionEvent, exception, message);
	}

	public static secs(): number {
		return Math.round(Date.now() / 1000)
	}

	public static isRagdollOnHeight(height: number): boolean {

		AntiCheat.range_to_btm = mp.game.gameplay.getGroundZFor3dCoord(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, true, false);

		if (Math.abs(AntiCheat.LocalPlayer.position.z - AntiCheat.range_to_btm) > Math.abs(height - AntiCheat.range_to_btm)) {
			if (!this.isWalking()) {
				return false;
			} else if (AntiCheat.active && AntiCheat.range_to_btm > 0) {
				return true;
			}
			return false
		}

		return false;
	}

	public static isWalking(): boolean {
		if (mp.players.local.isFalling() || mp.players.local.isRagdoll()) return false
		else if (!mp.players.local.vehicle) return true

		return false;
	}

	public static subtractVector(v1: Vector3, v2: Vector3): SubtractVector {

		let subtractResult: SubtractVector = {
			x: v1.x - v2.x,
			y: v1.y - v2.y,
			z: v1.z - v2.z
		}

		return subtractResult;
	}

	public static VehicleFasterThan(max: number) {
		if (AntiCheat.LocalPlayer.vehicle && !(AntiCheat.blockedVehicleClasses.indexOf(AntiCheat.LocalPlayer.vehicle.getClass()) == -1)) {
			return mp.players.local.vehicle.getSpeed() * 3.6 > max;
		}
		return false
	}

	public static checkCarPos(maxHeight = 50): boolean {
		if (mp.players.local.vehicle) {
			if (!(AntiCheat.blockedVehicleClasses.indexOf(AntiCheat.LocalPlayer.vehicle.getClass()) == -1)) {
				AntiCheat.range_to_btm = mp.game.gameplay.getGroundZFor3dCoord(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, true, false);
				if (mp.players.local.position.z - AntiCheat.range_to_btm > maxHeight + AntiCheat.range_to_btm) {
					return true
				}
				return false
			}
		}

		return true;
	}

	public static checkWeaponhash() {
		let h = AntiCheat.weapon;
		if (AntiCheat.blockedHashes.indexOf(h) != -1) {
			return true
		}
		return false
	}

	public static resetWeapon() {
		AntiCheat.weapon = mp.game.invoke(`0x0A6DB4965674D243`, AntiCheat.LocalPlayer.handle)
		AntiCheat.magazine = mp.game.weapon.getWeaponClipSize(AntiCheat.weapon)
		AntiCheat.reloadingWeapon = false;
	}

	public static updateMagSize() {
		AntiCheat.weapon = mp.game.invoke(`0x0A6DB4965674D243`, mp.players.local.handle)
		if (AntiCheat.firstShot) {
			AntiCheat.firstShot = false;
			AntiCheat.resetWeapon()
		}
		AntiCheat.magazine -= 1
		if (AntiCheat.magazine <= 0) {
			AntiCheat.reloadingWeapon = true;
			setTimeout(() => {
				AntiCheat.reloadingWeapon = false;
				AntiCheat.resetWeapon()
			}, 1250);
		}
	}
}

enum AcExceptions {
	tpHack = 0,
	disallowedWeapon = 1,
	vehicleSpeedOrFly = 2,
	noReloadHack = 3,
	ammoHack = 4
}


export default AntiCheat;
