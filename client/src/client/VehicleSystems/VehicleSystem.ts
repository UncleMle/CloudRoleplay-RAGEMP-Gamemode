import NotificationSystem from "@/NotificationSystem/NotificationSystem";
import { CF_PED_FLAG_CAN_FLY_THRU_WINDSCREEN, _control_ids } from "../Constants/Constants";
import isFlipped from "../PlayerMethods/getIfVehicleIsFlipped";

class VehicleSystems {
	public static LocalPlayer: PlayerMp;
	public static GameControls: GamePadMp;
	public static beltToggle: boolean;
	public static vehicleOldPos: Vector3;
	public static updateVehicleDistEvent: string = "server:updateVehicleDistance";
	public static toggleSeatBeltEvent: string = "vehicle:toggleSeatBelt";
	public static _seatBeltIdentifier: string = "playerIsWearingSeatBelt";
	public static updateDistInteral_seconds: number = 20;
	public static blockVehicleSeatBelts: number[] = [13, 14, 15, 16, 21, 8];

	constructor() {
		VehicleSystems.LocalPlayer = mp.players.local;
		VehicleSystems.GameControls = mp.game.controls;

		mp.events.add("render", VehicleSystems.handleRender);
		mp.events.add("playerLeaveVehicle", (veh: VehicleMp) => VehicleSystems.beltToggle ? VehicleSystems.toggleSeatBelt(veh) : null);
		mp.events.add("playerEnterVehicle", VehicleSystems.handlePlayerEnterVehicle);
		mp.events.add("playerLeaveVehicle", VehicleSystems.handleExitDistCalc);
		mp.keys.bind(_control_ids.F, false, VehicleSystems.stopWindowBreaking);
		mp.keys.bind(_control_ids.J, false, VehicleSystems.toggleSeatBelt);

		setInterval(() => {
			if(!VehicleSystems.LocalPlayer.vehicle) return;
			mp.events.callRemote(VehicleSystems.updateVehicleDistEvent, JSON.stringify(VehicleSystems.vehicleOldPos));
			VehicleSystems.vehicleOldPos = VehicleSystems.LocalPlayer.vehicle.position;
		}, VehicleSystems.updateDistInteral_seconds * 1000);
	}

	public static handlePlayerEnterVehicle(vehicle: VehicleMp, seat: number) {
		if(!vehicle) return;
		VehicleSystems.vehicleOldPos = vehicle.position;
	}

	public static handleExitDistCalc(vehicle: VehicleMp) {
		if(!vehicle) return;
		mp.events.callRemote(VehicleSystems.updateVehicleDistEvent, JSON.stringify(VehicleSystems.vehicleOldPos))
	}

	public static toggleSeatBelt(vehicle: VehicleMp) {
		if(VehicleSystems.LocalPlayer.isTypingInTextChat) return;

		if(!vehicle) {
			vehicle = VehicleSystems.LocalPlayer.vehicle;
		}

		if(vehicle) {
			if(VehicleSystems.blockVehicleSeatBelts.indexOf(vehicle.getClass()) !== -1) {
				NotificationSystem.createNotification("~r~This vehicle doesn't have a seatbelt!", false);
				return;
			}

			VehicleSystems.beltToggle = !VehicleSystems.beltToggle;

			mp.events.callRemote(VehicleSystems.toggleSeatBeltEvent, VehicleSystems.beltToggle);

			VehicleSystems.LocalPlayer.setConfigFlag(CF_PED_FLAG_CAN_FLY_THRU_WINDSCREEN, !VehicleSystems.beltToggle);

			NotificationSystem.createNotification(`You have ${VehicleSystems.beltToggle ? "buckled" : "unbuckled"} your seat belt.`, true, true, `${VehicleSystems.beltToggle ? "Buckles" : "Unbuckles"} seatbelt.`);
		}
	}

	public static handleRender() {
		if(VehicleSystems.LocalPlayer.vehicle && VehicleSystems.LocalPlayer.vehicle.getHealth() <= 0) {
			VehicleSystems.LocalPlayer.vehicle.setUndriveable(true);
		}

		if (VehicleSystems.LocalPlayer.vehicle && isFlipped(VehicleSystems.LocalPlayer.vehicle)) {
			VehicleSystems.disableControls();
		}

		if (VehicleSystems.LocalPlayer.vehicle) {
			VehicleSystems.turnOffRadio();
		}
	}

	public static stopWindowBreaking() {
		const vehHandle: number = mp.players.local.getVehicleIsTryingToEnter();

		if (vehHandle) {
			const vehicle = mp.vehicles.atHandle(vehHandle);
			if (!vehicle) return;

			if (vehicle.getDoorLockStatus() === 2) {
				let seat = -1;
				let e = 0;

				let interval = setInterval(() => {
					if (e === 15) {
						clearInterval(interval);
						return;
					}

					if (vehicle.getDoorLockStatus() === 1) {
						let data = mp.game.vehicle.getVehicleModelMaxNumberOfPassengers(vehicle.model);

						for (let i = -1, l = data; i < l; i++) {
							let isFree = vehicle.isSeatFree(i);

							if (isFree) {
								seat = i;
								VehicleSystems.LocalPlayer.taskEnterVehicle(vehicle.handle, 5000, seat, 2, 1, 0);
								clearInterval(interval);
								return;
							}
						}
					}
					e++;
				}, 200);
			}
		}
	}

	public static disableControls() {
		VehicleSystems.GameControls.disableControlAction(32, 59, true);
		VehicleSystems.GameControls.disableControlAction(32, 60, true);
		VehicleSystems.GameControls.disableControlAction(32, 61, true);
		VehicleSystems.GameControls.disableControlAction(32, 62, true);
		VehicleSystems.GameControls.disableControlAction(0, 59, true);
		VehicleSystems.GameControls.disableControlAction(0, 60, true);
		VehicleSystems.GameControls.disableControlAction(0, 61, true);
		VehicleSystems.GameControls.disableControlAction(0, 62, true);
		VehicleSystems.GameControls.disableControlAction(32, 63, true);
		VehicleSystems.GameControls.disableControlAction(0, 63, true);
	}

	public static turnOffRadio() {
		VehicleSystems.LocalPlayer.vehicle.setAlarm(true);
		mp.game.audio.setRadioToStationName("OFF");
		mp.game.audio.setUserRadioControlEnabled(false);
	}
}

export default VehicleSystems;
