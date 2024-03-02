import { TrackVehicles } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import getVehicleData from "@/PlayerMethods/getVehicleData";

export default class FactionSystem {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static TrackerBlips: Map<number, TrackVehicles> = new Map<number, TrackVehicles>();
    public static TrackingUnit: BlipMp;
    public static defaultBlipColour: number = 4;
    public static readonly trackerBlipColour: number = 46;

    constructor() {
        mp.events.add({
            "render": FactionSystem.handleRender,
            "entityStreamOut": (ent: EntityMp) => FactionSystem.handleStreamInOut(ent, false),
            "c::faction:tracking:update": FactionSystem.handleTrackingUpdate,
            "c::faction:tracking:remove": FactionSystem.handleTrackingRemove,
            "c::faction:tracking:clear": FactionSystem.clearAll,
            "c::faction:tracking:trackUnit": FactionSystem.handleUnitTrack,
            "c::faction:dispatch:toggle": FactionSystem.toggleDispatchMenu
        });
    }

    private static toggleDispatchMenu(toggle: boolean) {
        BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
            _stateKey: "dispatchMenuState",
            status: ${toggle}
        })`);
    }

    private static handleUnitTrack(vehicleId: number) {
        let tracker: TrackVehicles | undefined = FactionSystem.TrackerBlips.get(vehicleId);

        if (!tracker || tracker && !mp.blips.atHandle(tracker.blip.handle)) return;

        FactionSystem.removePrevTracked();

        if (FactionSystem.TrackingUnit && mp.blips.exists(FactionSystem.TrackingUnit)) {
            FactionSystem.TrackingUnit.setColour(FactionSystem.defaultBlipColour);
        }

        FactionSystem.TrackingUnit = tracker.blip;

        FactionSystem.TrackingUnit.setColour(FactionSystem.trackerBlipColour);
        FactionSystem.TrackingUnit.setRoute(true);

        tracker.beingTracked = true;
    }

    private static removePrevTracked() {
        FactionSystem.TrackerBlips.forEach(blip => {
            blip.beingTracked = false;
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

        if (tracker && mp.blips.exists(tracker.blip)) tracker.blip.destroy();

        FactionSystem.TrackerBlips.delete(vehicleId);
    }

    private static clearAll() {
        FactionSystem.TrackerBlips.forEach(blip => {
            if (blip && mp.blips.exists(blip.blip)) blip.blip.destroy();
        });

        FactionSystem.TrackerBlips.clear();
    }

    private static handleRender() {
        mp.vehicles.forEachInStreamRange(trackVeh => {
            let tracker: TrackVehicles | undefined = FactionSystem.TrackerBlips.get(trackVeh.remoteId);

            if (tracker && mp.blips.exists(tracker.blip)) {
                tracker.renderTracked = true;
                tracker.blip.position = trackVeh.position;

                tracker.blip.setCoords(trackVeh.position);
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

                if (blipData && mp.blips.exists(blipData.blip)) {
                    blipData.blip.position = targetPos;
                    blipData.blip.setRotation(blipData.heading);
                    blipData.blip.setCoords(targetPos);

                    if (blipData.beingTracked) {
                        blipData.blip.setRoute(false);
                        blipData.blip.setRoute(true);
                    }

                    return;
                }

                FactionSystem.defaultBlipColour = veh.blipColour;

                veh.blip = mp.blips.new(veh.blipType, targetPos, {
                    name: "Unit " + veh.numberPlate,
                    alpha: 255,
                    color: FactionSystem.defaultBlipColour,
                    shortRange: true
                });

                mp.game.invoke("0x5FBCA48327B914DF", veh.blip, true);
                mp.game.invoke("0x234CDD44D996FD9A", veh.blip, 2);

                FactionSystem.TrackerBlips.set(veh.remoteId, veh);
            });

        } catch
        {
        }
    }
}