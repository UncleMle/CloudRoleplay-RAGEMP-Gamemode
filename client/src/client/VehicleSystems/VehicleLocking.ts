import { _control_ids } from 'Constants/Constants';
import getClosestVehicleInRange from '../PlayerMethods/getVehicleInRange';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';

class VehicleLocking {
	public static LocalPlayer: PlayerMp;
	public static _lockVehicleRange: number = 5;
	public static _lockVehicleEvent: string = "vehicle:toggleLock";

	constructor() {
		VehicleLocking.LocalPlayer = mp.players.local;


		mp.keys.bind(_control_ids.K, false, VehicleLocking.toggleVehicleLock);
	}

	public static toggleVehicleLock() {
		if(!validateKeyPress()) return;

		let lockVehicle = getClosestVehicleInRange(VehicleLocking._lockVehicleRange);
		if (!lockVehicle) return;

		mp.events.callRemote(VehicleLocking._lockVehicleEvent, lockVehicle);
	}
}

export default VehicleLocking;
