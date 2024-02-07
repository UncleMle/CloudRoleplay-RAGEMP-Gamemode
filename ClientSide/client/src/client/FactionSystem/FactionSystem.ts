import { TrackVehicles } from "@/@types";

export default class FactionSystem {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static trackedVehicles: TrackVehicles[] = [];
    public static trackerBlips: BlipMp[] = [];

    constructor() {
        mp.events.add({
            "c::faction:tracking:update": FactionSystem.handleTrackingUpdate
        })
    }

    private static handleTrackingUpdate(data: string) {
        FactionSystem.trackedVehicles = JSON.parse(data);

        FactionSystem.trackerBlips?.forEach(blip => {
            if (blip && mp.blips.atHandle(blip.handle)) {
                FactionSystem.trackerBlips.splice(FactionSystem.trackerBlips.indexOf(blip), 1);
                blip.destroy();
            }
        });

        FactionSystem.trackedVehicles?.forEach(veh => {
            let tracker: BlipMp = mp.blips.new(56, new mp.Vector3(veh.position.x, veh.position.y, veh.position.z), {
                alpha: 255,
                color: 3
            });

            FactionSystem.trackerBlips.push(tracker);
        });
    }
}