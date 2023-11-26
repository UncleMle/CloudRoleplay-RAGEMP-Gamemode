import isFlipped from "../PlayerMethods/getIfVehicleIsFlipped";

class VehicleSystems {
	public static LocalPlayer: PlayerMp;

	constructor() {
		VehicleSystems.LocalPlayer = mp.players.local;

		mp.events.add("render", VehicleSystems.handleRender);
	}

	public static handleRender() {
		if (VehicleSystems.LocalPlayer.vehicle && isFlipped(VehicleSystems.LocalPlayer.vehicle)) {
			VehicleSystems.disableControls();
		}
	}

	public static disableControls() {
		mp.game.controls.disableControlAction(32, 59, true);
		mp.game.controls.disableControlAction(32, 60, true);
		mp.game.controls.disableControlAction(32, 61, true);
		mp.game.controls.disableControlAction(32, 62, true);
		mp.game.controls.disableControlAction(0, 59, true);
		mp.game.controls.disableControlAction(0, 60, true);
		mp.game.controls.disableControlAction(0, 61, true);
		mp.game.controls.disableControlAction(0, 62, true);
		mp.game.controls.disableControlAction(32, 63, true);
		mp.game.controls.disableControlAction(0, 63, true);
	}
}

export default VehicleSystems;
