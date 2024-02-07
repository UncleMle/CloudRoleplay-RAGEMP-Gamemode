import { TrackVehicles } from "@/@types";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import getVehicleData from "@/PlayerMethods/getVehicleData";

export default class FactionSystem {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static TrackerBlips: Map<number, TrackVehicles> = new Map<number, TrackVehicles>();

    constructor() {
        mp.events.add({
            "render": FactionSystem.handleRender,
            "entityStreamOut": (ent: EntityMp) => FactionSystem.handleStreamInOut(ent, false),
            "c::faction:tracking:update": FactionSystem.handleTrackingUpdate,
            "c::faction:tracking:remove": FactionSystem.handleTrackingRemove,
            "c::faction:tracking:clear": FactionSystem.clearAll
        });
    }

    private static async handleStreamInOut(entity: EntityMp, toggle: boolean) {
        if (entity.type === "vehicle") {

            await mp.game.waitAsync(500);

            if (!mp.vehicles.atRemoteId(entity.remoteId)) return;

            let character = getUserCharacterData();

            if (!character) return;

            let duty: number = character.faction_duty_status;

            if (getVehicleData(entity as VehicleMp)?.faction_owner_id !== duty) return;

            let tracker: TrackVehicles | undefined = FactionSystem.TrackerBlips.get(entity.remoteId);

            if (tracker) {
                tracker.renderTracked = toggle;
            }
        }
    }

    private static handleTrackingRemove(vehicleId: number) {
        let tracker: TrackVehicles | undefined = FactionSystem.TrackerBlips.get(vehicleId);

        if (tracker && mp.blips.atHandle(tracker.blip.handle)) tracker.blip.destroy();

        FactionSystem.TrackerBlips.delete(vehicleId);
    }

    private static clearAll() {
        FactionSystem.TrackerBlips.forEach(blip => {
            if (blip && mp.blips.atHandle(blip.blip.handle)) blip.blip.destroy();
        });

        FactionSystem.TrackerBlips.clear();
    }

    private static handleRender() {
        mp.vehicles.forEachInStreamRange(trackVeh => {
            let tracker: TrackVehicles | undefined = FactionSystem.TrackerBlips.get(trackVeh.remoteId);

            if (tracker && mp.blips.atHandle(tracker.blip.handle)) {
                tracker.renderTracked = true;
                tracker.blip.position = trackVeh.position;
                tracker.blip.setRotation(trackVeh.getHeading());
            }
        });
    }

    private static handleTrackingUpdate(data: string) {
        try {
            let trackerVehicles: TrackVehicles[] = JSON.parse(data);

            trackerVehicles?.forEach(veh => {
                let blipData: TrackVehicles | undefined = FactionSystem.TrackerBlips.get(veh.remoteId);

                let targetPos = new mp.Vector3(veh.position.x, veh.position.y, veh.position.z);

                if (blipData?.renderTracked) return;

                if (blipData && mp.blips.atHandle(blipData.blip.handle)) {
                    blipData.blip.position = targetPos;
                    blipData.blip.setRotation(blipData.heading);
                    return;
                }

                veh.blip = mp.blips.new(veh.blipType, targetPos, {
                    name: "Unit " + veh.numberPlate,
                    alpha: 255,
                    color: 3
                });

                FactionSystem.TrackerBlips.set(veh.remoteId, veh);
            });

        } catch
        {
        }
    }
}