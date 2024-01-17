import { FreeLanceJobData, FreeLanceJobVehicleData } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids, _sharedFreelanceJobData, _sharedFreelanceJobVehicleDataIdentifier } from "@/Constants/Constants";
import { Browsers, FreelanceJobs } from "@/enums";

export default class BusDriverJob {
    private static LocalPlayer: PlayerMp = mp.players.local;
    private static BusStopBlip: BlipMp | undefined;
    private static readonly _busDepoColShapeData: string = "playerEnteredBusDepoColshape";
    public static readonly startRemoteEvent: string = "server:playerAttemptBusJobStart";

    constructor() {
        mp.events.add({
            "client:setBusDriverBlipCoord": BusDriverJob.handleBlipSet,
            "client:busDriverclearBlips": BusDriverJob.clearBlips,
            "client:busFreezeForStop": BusDriverJob.freezeVehicle,
            "render": BusDriverJob.handleBrowserOpen,
            "playerEnterVehicle": (veh: VehicleMp) => BusDriverJob.handleVehLeaveEnter(veh, true),
            "playerLeaveVehicle": (veh: VehicleMp) => BusDriverJob.handleVehLeaveEnter(veh, false),
        });

        mp.keys.bind(_control_ids.Y, false, BusDriverJob.handleKeyPress);
    }

    private static handleBrowserOpen() {
        if (BusDriverJob.LocalPlayer.browserRouter === Browsers.ViewBusRoutes) {
            mp.gui.cursor.show(true, true);
        }
    }

    private static clearBlips() {
        if (BusDriverJob.BusStopBlip) {
            BusDriverJob.BusStopBlip.destroy();
            BusDriverJob.BusStopBlip = undefined;
        }
    }

    private static handleBlipSet(pos_x: number, pos_y: number, pos_z: number, isDepot: boolean = false) {
        let targetVector: Vector3 = new mp.Vector3(pos_x, pos_y, pos_z);

        if (targetVector) {
            BusDriverJob.clearBlips();

            BusDriverJob.BusStopBlip = mp.blips.new(1, targetVector,
                {
                    name: "Bus Stop",
                    scale: 1,
                    color: isDepot ? 69 : 3,
                    alpha: 255,
                    drawDistance: 10,
                    shortRange: false,
                    rotation: 0,
                    dimension: 0,
                });

            BusDriverJob.BusStopBlip.setRoute(true);
        }
    }

    private static freezeVehicle(toggle: boolean) {
        if (BusDriverJob.LocalPlayer.vehicle) {
            BusDriverJob.LocalPlayer.vehicle.freezePosition(toggle);
        }
    }

    private static handleVehLeaveEnter(vehicle: VehicleMp, uiToggle: boolean) {
        if(!vehicle) return;
        let vehicleBusData: FreeLanceJobVehicleData = vehicle.getVariable(_sharedFreelanceJobVehicleDataIdentifier);
        let freelanceJobData: FreeLanceJobData = BusDriverJob.LocalPlayer.getVariable(_sharedFreelanceJobData);

        mp.gui.chat.push(JSON.stringify(vehicleBusData));
        
        if (freelanceJobData && freelanceJobData.jobId === FreelanceJobs.BusJob && vehicleBusData?.jobId === FreelanceJobs.BusJob) {
            BrowserSystem._browserInstance.execute(`appSys.commit('setUiState', {
                _stateKey: "busDriverUi",
                status: ${uiToggle}
            })`);
        }
    }

    private static handleKeyPress() {
        if (BusDriverJob.LocalPlayer.getVariable(BusDriverJob._busDepoColShapeData)) {
            mp.events.callRemote(BusDriverJob.startRemoteEvent);
        }
    }
}