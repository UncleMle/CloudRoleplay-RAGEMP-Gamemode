export default class MarkersAndLabels {
    public static LocalPlayer: PlayerMp;
    public static readonly defaultBlipTimeout_seconds: number = 30;
    private static createBlip: BlipMp | undefined;
    private static createMarker: MarkerMp | undefined;
    private static deleteInterval: ReturnType<typeof setInterval> | undefined;
    private static blips: Map<Vector3, BlipMp> = new Map<Vector3, BlipMp>();

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

    private static flushBlipArray() {
        MarkersAndLabels.blips.forEach(blip => {
            if(blip && mp.blips.exists(blip)) {
                blip.destroy();
            }
        });

        MarkersAndLabels.blips.clear();
    }

    private static addArrayOfBlips(blips: Vector3[], blipType: number, blipColour: number, name: string) {
        blips.forEach(blip => {
            let created: BlipMp = mp.blips.new(blipType, blip, {
                color: blipColour,
                name: name
            });

            MarkersAndLabels.blips.set(blip, created);
        })    
    }

    private static deleteFromBlipArray(position: string) {
        let val: BlipMp | undefined = MarkersAndLabels.blips.get(JSON.parse(position));
        
        mp.gui.chat.push(position + " __ " + val);

        if(val && mp.blips.exists(val)) {
            val.destroy();

            MarkersAndLabels.blips.delete(JSON.parse(position));
        }
    }

    public static setWaypoint(coords: Vector3) {
        mp.game.ui.setNewWaypoint(coords.x,  coords.y);
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