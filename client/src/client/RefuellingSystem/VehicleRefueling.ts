import { RefuelStation } from '@/@types';
import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import { _control_ids } from '@/Constants/Constants';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';

class VehicleRefueling {
	public static LocalPlayer: PlayerMp;
	public static _refuelPumpIdenfitier: string = 'refuelingPumpData';
	public static _refuelServerEvent: string = 'server:refuelVehicleCycle';
	public static _startRefuelEvent: string = 'server:startRefuelEvent';
	public static refuelInterval: ReturnType<typeof setInterval> | undefined;
	public static _refuelInterval_seconds: number = 2;
    public static _refuelDataIdentifier: string = "playerRefuelData";

	constructor() {
		VehicleRefueling.LocalPlayer = mp.players.local;

		mp.events.add('refuel:closeRefuelInterval', VehicleRefueling.endRefuelling);
		mp.events.add('refuel:startRefuelInterval', VehicleRefueling.startRefuelInterval);

		mp.keys.bind(_control_ids.Y, true, VehicleRefueling.handleKeyPress_Y);
	}

	public static handleKeyPress_Y() {
        if(!validateKeyPress(true)) return;

		let refuelStationData: RefuelStation | undefined = VehicleRefueling.LocalPlayer.getVariable(VehicleRefueling._refuelPumpIdenfitier);

		if (refuelStationData) {
			VehicleRefueling.endRefuelling();
            mp.events.callRemote(VehicleRefueling._startRefuelEvent);
		}
	}

    public static startRefuelInterval() {
        VehicleRefueling.refuelInterval = setInterval(() => {
            if(!VehicleRefueling.LocalPlayer.getVariable(VehicleRefueling._refuelDataIdentifier)) {
                mp.events.callRemote(VehicleRefueling._refuelServerEvent, true);
                VehicleRefueling.endRefuelling();
                return;
            }

            if (mp.keys.isDown(_control_ids.Y)) {
                VehicleRefueling.toggleFuelUi(true);
                mp.events.callRemote(VehicleRefueling._refuelServerEvent, false);
            } else {
                VehicleRefueling.endRefuelling();
                mp.events.callRemote(VehicleRefueling._refuelServerEvent, true);
            }
        }, VehicleRefueling._refuelInterval_seconds * 1000);
    }

	public static endRefuelling() {
		if (VehicleRefueling.refuelInterval) {

			VehicleRefueling.toggleFuelUi(false);
			clearInterval(VehicleRefueling.refuelInterval);
			VehicleRefueling.refuelInterval = undefined;
		}
	}

	public static toggleFuelUi(toggle: boolean) {
		BrowserSystem._browserInstance.execute(`appSys.commit('setUiState', {
            _stateKey: "refuelUi",
            status: ${toggle}
        })`);
	}
}

export default VehicleRefueling;
