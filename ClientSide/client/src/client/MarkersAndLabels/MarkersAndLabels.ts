export default class MarkersAndLabels {
    public static LocalPlayer: PlayerMp;
    public static readonly defaultBlipTimeout_seconds: number = 30;

    constructor() {
        MarkersAndLabels.LocalPlayer = mp.players.local;

        mp.events.add("clientBlip:addClientBlip", MarkersAndLabels.addClientBlip);
    }

    public static addClientBlip(blipSprite: number, name: string, position: Vector3, blipColour: number, alpha: number = 255, timeout: number = MarkersAndLabels.defaultBlipTimeout_seconds) {
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

        setTimeout(() => {
            if(createdBlip) {
                createdBlip.destroy();
                createdBlip = null;
            }
        }, timeout * 1000)
    }
}