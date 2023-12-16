import { VehicleData } from "../@types";
import { _SHARED_VEHICLE_DATA, _control_ids } from "../Constants/Constants";
import getVehicleData from "../PlayerMethods/getVehicleData";

class VehicleSiren {
	public static LocalPlayer: PlayerMp;
	public static readonly eventName: string = "server:toggleSiren";
	public static _emergencyClass: number = 18;

	constructor() {
		VehicleSiren.LocalPlayer = mp.players.local;

		mp.events.add("render", VehicleSiren.handleRender);
		mp.events.add("entityStreamIn", VehicleSiren.handleEntityStreamIn);
		mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleSiren.handleDataHandler);
		mp.keys.bind(_control_ids.QBIND, false, VehicleSiren.toggleVehicleSiren);
	}

	public static handleRender() {
		mp.vehicles.forEachInStreamRange((veh: VehicleMp) => {
			let vehicleData: VehicleData | undefined = getVehicleData(veh);
			if (!vehicleData) return;

			if (!vehicleData.vehicle_siren) {
				veh.setSirenSound(false);
			}

		});
	}

	public static handleEntityStreamIn(entity: VehicleMp) {
		if (entity.type != "vehicle") return;
		let vehicleData: VehicleData | undefined = getVehicleData(entity);
		if (!vehicleData) return;

		if(vehicleData.vehicle_siren) {
			entity.setSiren(true);
		}

		entity.setSirenSound(vehicleData.vehicle_siren);
	}

	public static handleDataHandler(entity: EntityMp, data: VehicleData) {
		if (entity.type != "vehicle" || !data) return;

		(entity as VehicleMp).setSirenSound(data.vehicle_siren);
	}

	public static toggleVehicleSiren() {
		if (!VehicleSiren.LocalPlayer.isTypingInTextChat && VehicleSiren.LocalPlayer.vehicle && VehicleSiren.LocalPlayer.vehicle.getClass() == VehicleSiren._emergencyClass) {
			let localPlayerVehicleData: VehicleData | undefined = getVehicleData(VehicleSiren.LocalPlayer.vehicle);
			if (!localPlayerVehicleData) return;

			mp.events.callRemote(VehicleSiren.eventName);
		}

	}
}

export default VehicleSiren;
