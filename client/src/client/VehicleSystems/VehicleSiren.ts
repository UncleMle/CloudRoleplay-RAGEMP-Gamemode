import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { VehicleData } from "../@types";
import { _SHARED_VEHICLE_DATA, _control_ids } from "../Constants/Constants";
import getVehicleData from "../PlayerMethods/getVehicleData";
import NotificationSystem from "@/NotificationSystem/NotificationSystem";

class VehicleSiren {
	public static LocalPlayer: PlayerMp;
	public static readonly eventName: string = "server:toggleSiren";
	public static readonly lightsEventName: string = "server:toggleEmergencyLights";
	public static _emergencyClass: number = 18;

	constructor() {
		VehicleSiren.LocalPlayer = mp.players.local;

		mp.events.add("render", VehicleSiren.handleRender);
		mp.events.add("entityStreamIn", VehicleSiren.handleEntityStreamIn);
		mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleSiren.handleDataHandler);

		mp.keys.bind(_control_ids.QBIND, false, VehicleSiren.toggleVehicleSiren);
		mp.keys.bind(_control_ids.EBIND, false, VehicleSiren.toggleEmergencyLights);
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

		mp.gui.chat.push(vehicleData.emergency_lights + " siren sound.");

		entity.setSiren(vehicleData.emergency_lights);
		entity.setSirenSound(vehicleData.vehicle_siren);
	}

	public static handleDataHandler(entity: VehicleMp, data: VehicleData) {
		if (entity.type != "vehicle" || !data) return;

		entity.setSirenSound(data.vehicle_siren);
	}

	public static toggleEmergencyLights() {
		if(!validateKeyPress() || !VehicleSiren.LocalPlayer.vehicle) return;

		if(VehicleSiren.LocalPlayer.vehicle.getClass() == VehicleSiren._emergencyClass) {
			let localPlayerVehicleData: VehicleData | undefined = getVehicleData(VehicleSiren.LocalPlayer.vehicle);
			if (!localPlayerVehicleData) return;

			mp.events.callRemote(VehicleSiren.lightsEventName);
		}
	}

	public static toggleVehicleSiren() {
		if(!validateKeyPress() || !VehicleSiren.LocalPlayer.vehicle) return;

		if(VehicleSiren.LocalPlayer.vehicle.getClass() == VehicleSiren._emergencyClass) {
			let localPlayerVehicleData: VehicleData | undefined = getVehicleData(VehicleSiren.LocalPlayer.vehicle);
			if (!localPlayerVehicleData) return;

			mp.events.callRemote(VehicleSiren.eventName);
		}
	}
}

export default VehicleSiren;
