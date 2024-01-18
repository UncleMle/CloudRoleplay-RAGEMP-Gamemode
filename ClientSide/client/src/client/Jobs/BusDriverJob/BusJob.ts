import { BusSharedData } from "@/@types";
import { _control_ids, _sharedFreelanceJobData, _sharedFreelanceJobVehicleDataIdentifier } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { Browsers } from "@/enums";

export default class BusDriverJob {
    private static LocalPlayer: PlayerMp = mp.players.local;
    private static BusStopBlip: BlipMp | undefined;
    private static BusStopMarker: MarkerMp | undefined;
    private static readonly _busDepoColShapeData: string = "playerEnteredBusDepoColshape";
    public static readonly startRemoteEvent: string = "server:playerAttemptBusJobStart";
    private static readonly _busVehicleData: string = "busDriverJobVehicleData";

    constructor() {
        mp.events.add({
            "client:setBusDriverBlipCoord": BusDriverJob.handleBlipSet,
            "client:busDriverclearBlips": BusDriverJob.clearBlips,
            "client:busFreezeForStop": BusDriverJob.freezeVehicle,
            "render": BusDriverJob.handleRender
        });

        mp.keys.bind(_control_ids.Y, false, BusDriverJob.handleKeyPress);
    }

    private static handleRender() {
        if (BusDriverJob.LocalPlayer.vehicle) {
            let nextStop: BusSharedData = BusDriverJob.LocalPlayer.vehicle.getVariable(BusDriverJob._busVehicleData);

            if(nextStop) {
                mp.game.graphics.drawText(`~y~Destination ${nextStop.destination}`, [0.1, 0.64], {
                    font: 4,
                    color: [255, 255, 255, 255],
                    scale: [0.45, 0.65],
                    outline: false
                });
                
                mp.game.graphics.drawText(`Next Stop ${nextStop.nextStop} ${nextStop.nextStop === nextStop.destination ? "~r~[Terminus]" : ""}`, [0.1, 0.70], {
                    font: 4,
                    color: [255, 255, 255, 255],
                    scale: [0.45, 0.45],
                    outline: false
                });
            }
        }


        if (BusDriverJob.LocalPlayer.browserRouter === Browsers.ViewBusRoutes) {
            mp.gui.cursor.show(true, true);
        }
    }

    private static clearBlips() {
        if (BusDriverJob.BusStopBlip) {
            BusDriverJob.BusStopBlip.destroy();
            BusDriverJob.BusStopBlip = undefined;
        }

        if(BusDriverJob.BusStopMarker) {
            BusDriverJob.BusStopMarker.destroy();
            BusDriverJob.BusStopMarker = undefined;
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
                
            BusDriverJob.BusStopMarker = mp.markers.new(1, new mp.Vector3(targetVector.x, targetVector.y, targetVector.z - 1), 2, {
                color: [0, 255, 0, 30],
                dimension: 0
            });

            BusDriverJob.BusStopBlip.setRoute(true);
        }
    }

    private static freezeVehicle(toggle: boolean) {
        if (BusDriverJob.LocalPlayer.vehicle) {
            BusDriverJob.LocalPlayer.vehicle.freezePosition(toggle);
        }
    }

    private static handleKeyPress() {
        if (validateKeyPress(true, true, true) && BusDriverJob.LocalPlayer.getVariable(BusDriverJob._busDepoColShapeData)) {
            mp.events.callRemote(BusDriverJob.startRemoteEvent);
        }
    }
}