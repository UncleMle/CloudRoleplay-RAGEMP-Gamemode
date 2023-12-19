import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import NotificationSystem from "@/NotificationSystem/NotificationSystem";

class PhoneSystem {
    public static LocalPlayer: PlayerMp;
    public static trackVehicleBlipDespawn_seconds: number = 40;
    public static trackerBlip: BlipMp | null;
    public static _phoneStatusIdentifer: string = "playerPhoneStatus";

    constructor() {
        PhoneSystem.LocalPlayer = mp.players.local;

        mp.events.add("phone:trackVehicle", PhoneSystem.trackVehicle);
    }

    public static trackVehicle(plate: string, x: number, y: number, z: number) {
        if(PhoneSystem.trackerBlip) {
            NotificationSystem.createNotification("~r~You are already tracking a vehicle.", false);
            return;
        }

        BrowserSystem.sendNotif(`You have tracked your vehicle [${plate}], it has been marked on the map. The blip will despawn in ${PhoneSystem.trackVehicleBlipDespawn_seconds} seconds.`, true, true, 6000);

        PhoneSystem.trackerBlip = mp.blips.new(523, new mp.Vector3(x, y, z), {
            alpha: 255,
            color: 49,
            dimension: 0,
            drawDistance: 1.0,
            name: `Tracked vehicle [${plate}]`,
            rotation: 0,
            scale: 1.0,
            shortRange: false
        });

        setTimeout(() => {
            if(PhoneSystem.trackerBlip) {
                PhoneSystem.trackerBlip.destroy();
                PhoneSystem.trackerBlip = null;
            }
        }, PhoneSystem.trackVehicleBlipDespawn_seconds * 1000);
    }
}

export default PhoneSystem;