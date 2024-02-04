export default class MarkersAndLabels {
    public static LocalPlayer: PlayerMp;
    public static readonly defaultBlipTimeout_seconds: number = 30;
    private static createBlip: BlipMp | undefined;
    private static createMarker: MarkerMp | undefined;
    private static deleteInterval: ReturnType<typeof setInterval> | undefined;

    constructor() {
        MarkersAndLabels.LocalPlayer = mp.players.local;

        mp.events.add("render", MarkersAndLabels.removeNorthBlip);

        mp.events.add("clientBlip:addClientBlip", MarkersAndLabels.addClientBlip);
        mp.events.add("clientBlip:removeClientBlip", MarkersAndLabels.removeClientBlip);
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