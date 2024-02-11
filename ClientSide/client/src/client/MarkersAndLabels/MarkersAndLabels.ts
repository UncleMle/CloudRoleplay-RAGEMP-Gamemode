import { ClientBlip } from "@/@types";

export default class MarkersAndLabels {
    public static LocalPlayer: PlayerMp;
    public static readonly defaultBlipTimeout_seconds: number = 30;
    private static createBlip: BlipMp | undefined;
    private static createMarker: MarkerMp | undefined;
    private static deleteInterval: ReturnType<typeof setInterval> | undefined;
    private static blips: Map<number, ClientBlip> = new Map<number, ClientBlip>();

    constructor() {
        MarkersAndLabels.LocalPlayer = mp.players.local;

        mp.events.add("render", MarkersAndLabels.removeNorthBlip);

        mp.events.add("clientBlip:addClientBlip", MarkersAndLabels.addClientBlip);
        mp.events.add("clientBlip:removeClientBlip", MarkersAndLabels.removeClientBlip);
        mp.events.add("clientBlip:setWaypoint", MarkersAndLabels.setWaypoint);
        mp.events.add("clientBlip:addArrayOfBlips", MarkersAndLabels.addArrayOfBlips);
        mp.events.add("clientBlip:handleBlipDelete", MarkersAndLabels.deleteFromBlipArray);
        mp.events.add("clientBlip:flushBlipArray", MarkersAndLabels.flushBlipArray);
    }

    private static addArrayOfBlips(blips: ClientBlip[]) {
        blips.forEach(blip => {
            blip.blip = mp.blips.new(blip.type, blip.pos, {
                name: blip.name,
                color: blip.colour
            });

            if (blip.setMarker) {
                blip.marker = mp.markers.new(1, new mp.Vector3(blip.pos.x, blip.pos.y, blip.pos.z - 1), 2, {
                    color: [0, 255, 0, 30],
                    dimension: 0
                });
            }

            MarkersAndLabels.blips.set(blip.blipId, blip);
        });
    }

    private static deleteFromBlipArray(blipId: number) {
        let blip: ClientBlip | undefined = MarkersAndLabels.blips.get(blipId);

        if (!blip) return;

        if (mp.blips.exists(blip.blip)) {
            blip.blip.destroy();

            if(blip.setMarker && mp.markers.exists(blip.marker)) blip.marker.destroy();

            MarkersAndLabels.blips.delete(blipId);
        }
    }

    private static flushBlipArray() {
        MarkersAndLabels.blips.forEach(blip => {
            if (blip.blip && mp.blips.exists(blip.blip)) {
                blip.blip.destroy();

                if(blip.setMarker && mp.markers.exists(blip.marker)) blip.marker.destroy(); 

                MarkersAndLabels.blips.delete(blip.blipId);
            }
        });

    }

    public static setWaypoint(coords: Vector3) {
        mp.game.ui.setNewWaypoint(coords.x, coords.y);
    }

    public static removeNorthBlip() {
        mp.game.ui.setBlipAlpha(mp.game.invoke("0x3F0CF9CB7E589B88"), 0);
    }

    public static addClientBlip(blipSprite: number, name: string, position: Vector3, blipColour: number, alpha: number = 255, timeout: number = MarkersAndLabels.defaultBlipTimeout_seconds, setRoute: boolean = false, setMarker: boolean = false) {
        MarkersAndLabels.removeClientBlip();

        let createdBlip: BlipMp | null = mp.blips.new(blipSprite, position, {
            alpha: alpha,
            color: blipColour,
            dimension: 0,
            drawDistance: 1.0,
            name: name,
            rotation: 0,
            scale: 1.0,
            shortRange: false
        });

        MarkersAndLabels.createBlip = createdBlip;

        createdBlip.setRoute(setRoute);

        if (setMarker) {
            MarkersAndLabels.createMarker = mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 1), 2, {
                color: [0, 255, 0, 30],
                dimension: 0
            });
        }

        if (timeout != -1) {
            MarkersAndLabels.deleteInterval = setTimeout(() => {
                MarkersAndLabels.removeClientBlip();
            }, timeout * 1000);
        }
    }

    public static removeClientBlip() {
        if (MarkersAndLabels.deleteInterval) {
            clearInterval(MarkersAndLabels.deleteInterval);
            MarkersAndLabels.deleteInterval = undefined;
        }

        if (MarkersAndLabels.createMarker) {
            MarkersAndLabels.createMarker.destroy();
            MarkersAndLabels.createMarker = undefined;
        }

        if (MarkersAndLabels.createBlip) {
            MarkersAndLabels.createBlip.destroy();
            MarkersAndLabels.createBlip = undefined;
        }
    }
}