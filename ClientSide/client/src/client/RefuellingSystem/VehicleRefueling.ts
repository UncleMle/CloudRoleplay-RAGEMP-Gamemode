import { RefuelStation } from '@/@types';
import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import { _control_ids } from '@/Constants/Constants';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';

export default class VehicleRefueling {
	public static LocalPlayer: PlayerMp;
	public static _refuelPumpIdenfitier: string = 'refuelingPumpData';
	public static _refuelServerEvent: string = 'server:refuelVehicleCycle';
	public static _startRefuelEvent: string = 'server:startRefuelEvent';
	public static _stopRefuelEvent: string = 'server:stopRefuellingVehicle';
	public static refuelInterval: ReturnType<typeof setInterval> | undefined;
	public static _refuelInterval_seconds: number = 1.5;
    public static _refuelDataIdentifier: string = "playerRefuelData";

	constructor() {
		VehicleRefueling.LocalPlayer = mp.players.local;

        mp.events.add("entityStreamIn", VehicleRefueling.handleEntityStreamIn);

		mp.events.add('refuel:closeRefuelInterval', VehicleRefueling.endRefuelling);
		mp.events.add('refuel:startRefuelInterval', VehicleRefueling.startRefuelInterval);

		mp.keys.bind(_control_ids.Y, true, VehicleRefueling.handleKeyPress_Y);

        mp.events.addDataHandler(VehicleRefueling._refuelDataIdentifier, VehicleRefueling.handleRefuellingDataHandler);
	}

	public static handleKeyPress_Y() {
        if(!validateKeyPress(true)) return;

		let refuelStationData: RefuelStation | undefined = VehicleRefueling.LocalPlayer.getVariable(VehicleRefueling._refuelPumpIdenfitier);

		if (refuelStationData) {
			VehicleRefueling.endRefuelling(true);
            mp.events.callRemote(VehicleRefueling._startRefuelEvent);
		}
	}

    public static startRefuelInterval() {
        VehicleRefueling.refuelInterval = setInterval(() => {
            if(mp.keys.isDown(_control_ids.Y)) {
                VehicleRefueling.toggleFuelUi(true);
                mp.events.callRemote(VehicleRefueling._refuelServerEvent);
            } else {
                mp.events.callRemote(VehicleRefueling._stopRefuelEvent, "You have stopped refuelling.");
            }
        }, VehicleRefueling._refuelInterval_seconds * 1000);
    }

	public static endRefuelling(callRemote: boolean = false) {
		if (VehicleRefueling.refuelInterval) {
			VehicleRefueling.toggleFuelUi(false);
			clearInterval(VehicleRefueling.refuelInterval);
			VehicleRefueling.refuelInterval = undefined;

            if(callRemote) {
                mp.events.callRemote(VehicleRefueling._stopRefuelEvent, "");
            }
        }
	}

    public static async handleEntityStreamIn(entity: PlayerMp) {
        if(entity.type != "player") return;
        let refuelData: RefuelStation | undefined = entity.getVariable(VehicleRefueling._refuelDataIdentifier);

        if(refuelData) {
            VehicleRefueling.playRefuelAnimation(entity);
            VehicleRefueling.attachFuelObjectToEntity(entity);
        } else {
            entity.clearTasks();
            VehicleRefueling.removeFuelNozzleForEntity(entity);
        }
    }

    public static async handleRefuellingDataHandler(entity: PlayerMp, data: RefuelStation) {
        if(entity.type != "player") return;

        if(data) {
            VehicleRefueling.playRefuelAnimation(entity);
            VehicleRefueling.attachFuelObjectToEntity(entity);
        } else {
            VehicleRefueling.removeFuelNozzleForEntity(entity);
            entity.clearTasks();
        }
    }

	public static toggleFuelUi(toggle: boolean) {
		BrowserSystem._browserInstance.execute(`appSys.commit('setUiState', {
            _stateKey: "refuelUi",
            status: ${toggle}
        })`);
	}

    public static async playRefuelAnimation(entity: PlayerMp) {
        for (let i = 0; entity.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }

        mp.game.streaming.requestAnimDict('timetable@gardener@filling_can');

        await mp.game.waitAsync(50);

        entity.taskPlayAnim('timetable@gardener@filling_can', 'gar_ig_5_filling_can', 8.0, 1.0, -1, 1, 1.0, false, false, false);
    }

    public static async attachFuelObjectToEntity(entity: PlayerMp) {
        VehicleRefueling.removeFuelNozzleForEntity(entity);

        entity._fuelNozzleObject = mp.objects.new('prop_cs_fuel_nozle', entity.position, {
            rotation: new mp.Vector3(0, 0, 0),
            alpha: 255,
            dimension: entity.dimension
        });

        if(!entity._fuelNozzleObject) return;

        for (let i = 0; entity._fuelNozzleObject && entity._fuelNozzleObject?.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }

        let boneIdx: number = entity.getBoneIndex(18905);
        entity._fuelNozzleObject.attachTo(entity.handle, boneIdx, 0.11, 0.02, 0.02, -80.0, -90.0, 15.0, true, true, false, false, 0, true);
    }

    public static removeFuelNozzleForEntity(entity: PlayerMp) {
        if(entity._fuelNozzleObject) {
            entity._fuelNozzleObject.destroy();
            entity._fuelNozzleObject = null;
        }
    }
}
