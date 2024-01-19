export default class MarkersAndLabels {
    public static LocalPlayer: PlayerMp;
    public static readonly defaultBlipTimeout_seconds: number = 30;
    private static createBlip: BlipMp | undefined;
    private static deleteInterval: ReturnType<typeof setInterval> | undefined;

    constructor() {
        MarkersAndLabels.LocalPlayer = mp.players.local;

        mp.events.add("clientBlip:addClientBlip", MarkersAndLabels.addClientBlip);
        mp.events.add("clientBlip:removeClientBlip", MarkersAndLabels.removeClientBlip);
    }

    public static addClientBlip(blipSprite: number, name: string, position: Vector3, blipColour: number, alpha: number = 255, timeout: number = MarkersAndLabels.defaultBlipTimeout_seconds, setRoute: boolean = false) {
        MarkersAndLabels.removeClientBlip();

        let createdBlip: BlipMp | null = mp.blips.new(blipSprite, position, {
            alpha: alpha,
            color: blipColour,
            dimension: 0,
            drawDistance: 1.0,
            name: name,
            rotation: 0,
            scale: 1.0,
            shortRange: true
        });

        MarkersAndLabels.createBlip = createdBlip;

        createdBlip.setRoute(setRoute);
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

        if (MarkersAndLabels.createBlip) {
            MarkersAndLabels.createBlip.destroy();
            MarkersAndLabels.createBlip = undefined;
        }
    }
}