import { _control_ids } from "../Constants/Constants";
import isFlipped from "../PlayerMethods/getIfVehicleIsFlipped";

class VehicleSystems {
	public static LocalPlayer: PlayerMp;
	public static GameControls: GamePadMp;

	constructor() {
		VehicleSystems.LocalPlayer = mp.players.local;
		VehicleSystems.GameControls = mp.game.controls;

		mp.events.add("render", VehicleSystems.handleRender);
		mp.keys.bind(_control_ids.F, false, VehicleSystems.stopWindowBreaking);
	}

	public static handleRender() {
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
