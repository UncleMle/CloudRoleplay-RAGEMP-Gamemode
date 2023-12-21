import { Flight, UserData } from '@types';
import { _control_ids, SET_PARTICLE_FX_, _SET_FORCE_PED_FOOTSTEPS_TRACKS } from '../Constants/Constants';
import getUserData from '../PlayerMethods/getUserData';
import { AdminRanks } from '../enums';
import getTargetData from '@/PlayerMethods/getTargetData';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';

class AdminFly {
	public static LocalPlayer: PlayerMp;
	public static direction: Vector3;
	public static gameplayCam: CameraMp;
	public static coords: Vector3;
	public static flightData: Flight;
	public static updated: boolean;
	public static gameControls: GamePadMp;
	public static flyEvent: string = "admin:fly";

	constructor() {
		AdminFly.LocalPlayer = mp.players.local;
		AdminFly.gameplayCam = mp.cameras.new('gameplay');

		let newFlight: Flight = {
			flying: false,
			f: 11.0,
			w: 1.0,
			h: 1.0,
			l: 1.0,
			point_distance: 1000
		};

		AdminFly.flightData = newFlight;

		mp.events.add("render", AdminFly.handleFlyOnRender);
		mp.events.add("admin:startFly", AdminFly.handleFlyStartup);
		mp.events.add("admin:endFly", AdminFly.handleFlyEnd);

		mp.keys.bind(_control_ids.F4, false, AdminFly.handleFlyClick);
	}

	public static handleFlyClick() {
		if(!validateKeyPress()) return;

		let userData: UserData | undefined = getUserData();
		if(!userData) return;

		if(userData?.adminDuty || userData.admin_status > AdminRanks.Admin_HeadAdmin) {
			mp.events.callRemote(AdminFly.flyEvent);
		}
	}

	public static handleFlyStartup() {
		let localUserData: UserData | undefined = getUserData();
		if (!localUserData) return;

		if (localUserData?.admin_status > AdminRanks.Admin_SeniorSupport) {
			AdminFly.LocalPlayer.freezePosition(true);
			AdminFly.LocalPlayer.setInvincible(true);
		}
	}

	public static handleFlyEnd() {
		AdminFly.LocalPlayer.setAlpha(255);
		AdminFly.LocalPlayer.freezePosition(false);
		AdminFly.LocalPlayer.setInvincible(false);

		mp.vehicles.forEach(veh => {
			veh.setNoCollision(AdminFly.LocalPlayer.handle, true);
		});
	}

	public static handleFlyOnRender() {
		AdminFly.direction = AdminFly.gameplayCam.getDirection();
		AdminFly.coords = AdminFly.gameplayCam.getCoord();
		AdminFly.gameControls = mp.game.controls;
		let localUserData: UserData | undefined = getUserData();

		mp.players.forEach(player => {
			let userData: UserData | undefined = getTargetData(player);

			if(userData && userData.isFlying) {
				player.setAlpha(0);
			}
		})

		if (!localUserData) return;

		if (localUserData.adminDuty || localUserData.isFlying) {
			mp.game.invoke(_SET_FORCE_PED_FOOTSTEPS_TRACKS, false);
			mp.game.invoke(SET_PARTICLE_FX_, 'ped_foot_water');
			AdminFly.LocalPlayer.setCanRagdoll(false);
			AdminFly.LocalPlayer.setInvincible(true);
		} else {
			AdminFly.LocalPlayer.setCanRagdoll(true);
			AdminFly.LocalPlayer.setInvincible(false);
		}

		if (localUserData.isFlying) {
			let updated: boolean = false;
			AdminFly.LocalPlayer.setAlpha(0);

			mp.vehicles.forEach(veh => {
				veh.setNoCollision(mp.players.local.handle, false);
			});

			const position: Vector3 = AdminFly.LocalPlayer.position;
			if (AdminFly.gameControls.isControlPressed(0, _control_ids.W)) {
				if (AdminFly.flightData.f < 8.0) { AdminFly.flightData.f *= 11.025; }

				position.x += AdminFly.direction.x / (AdminFly.flightData.f / 7);
				position.y += AdminFly.direction.y / (AdminFly.flightData.f / 7);
				position.z += AdminFly.direction.z / (AdminFly.flightData.f / 7);
				updated = true;
			} else if (AdminFly.gameControls.isControlPressed(0, _control_ids.S)) {
				if (AdminFly.flightData.f < 8.0) { AdminFly.flightData.f *= 11.025; }

				position.x -= AdminFly.direction.x / (AdminFly.flightData.f / 8);
				position.y -= AdminFly.direction.y / (AdminFly.flightData.f / 8);
				position.z -= AdminFly.direction.z / (AdminFly.flightData.f / 8);
				updated = true;
			}
			else if (AdminFly.gameControls.isControlPressed(0, _control_ids.LCtrl)) {
				if (AdminFly.flightData.f < 8.0) { AdminFly.flightData.f *= 11.025; }

				position.x += AdminFly.direction.x / (AdminFly.flightData.f / 60);
				position.y += AdminFly.direction.y / (AdminFly.flightData.f / 60);
				position.z += AdminFly.direction.z / (AdminFly.flightData.f / 60);
				updated = true;
			}
			else {
				AdminFly.flightData.f = 2.0;
			}

			if (AdminFly.gameControls.isControlPressed(0, _control_ids.A)) {
				if (AdminFly.flightData.l < 8.0) { AdminFly.flightData.l *= 11.025; }

				position.x += (-AdminFly.direction.y) / (AdminFly.flightData.l / 7);
				position.y += AdminFly.direction.x / (AdminFly.flightData.l / 7);
				updated = true;
			} else if (AdminFly.gameControls.isControlPressed(0, _control_ids.D)) {
				if (AdminFly.flightData.l < 8.0) { AdminFly.flightData.l *= 11.025; }

				position.x -= (-AdminFly.direction.y) / (AdminFly.flightData.l / 8);
				position.y -= AdminFly.direction.x / (AdminFly.flightData?.l / 8);
				updated = true;
			} else {
				AdminFly.flightData.l = 2.0;
			}

			if (AdminFly.gameControls.isControlPressed(0, _control_ids.E)) {
				if (AdminFly.flightData.h < 8.0) { AdminFly.flightData.h *= 11.025; }

				position.z += (AdminFly.flightData.h / 55);
				updated = true;
			} else if (AdminFly.gameControls.isControlPressed(0, _control_ids.Q)) {
				if (AdminFly.flightData.h < 8.0) { AdminFly.flightData.h *= 11.025; }

				position.z -= (AdminFly.flightData.h / 55);
				updated = true;
			} else {
				AdminFly.flightData.h = 2.0;
			}

			if (updated) {
				mp.players.local.setCoordsNoOffset(position.x, position.y, position.z, false, false, false);
			}
		}
	}

}

export default AdminFly;
