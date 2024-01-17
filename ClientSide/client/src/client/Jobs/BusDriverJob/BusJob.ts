import { FreeLanceJobData } from "@/@types";
import { _control_ids, _sharedFreelanceJobData } from "@/Constants/Constants";
import { FreelanceJobs } from "@/enums";

export default class BusDriverJob {
    private static LocalPlayer: PlayerMp = mp.players.local;
    private static BusStopBlip: BlipMp | undefined;
    private static readonly _busDepoColShapeData: string = "playerEnteredBusDepoColshape";
    public static readonly startRemoteEvent: string = "server:playerAttemptBusJobStart";

    constructor() {
        mp.events.add({
            "client:setBusDriverBlipCoord": BusDriverJob.handleBlipSet,
            "client:busDriverclearBlips": BusDriverJob.clearBlips,
            "playerEnterVehicle": BusDriverJob.handleEnterVehicle,
            "client:busFreezeForStop": BusDriverJob.freezeVehicle
        });

        mp.keys.bind(_control_ids.Y, false, BusDriverJob.handleKeyPress);
    }

    private static clearBlips() {
        if(BusDriverJob.BusStopBlip) {
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

    private static handleEnterVehicle(vehicle: VehicleMp) {
        let freelanceJobData: FreeLanceJobData = BusDriverJob.LocalPlayer.getVariable(_sharedFreelanceJobData);

        if (freelanceJobData && freelanceJobData.jobId === FreelanceJobs.BusJob) {
        }
    }

    private static handleKeyPress() {
        if (BusDriverJob.LocalPlayer.getVariable(BusDriverJob._busDepoColShapeData)) {
            mp.events.callRemote(BusDriverJob.startRemoteEvent);
        }
    }
}