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
        mp.events.add("entityStreamIn", PhoneSystem.handleStreamIn);

        mp.events.addDataHandler(PhoneSystem._phoneStatusIdentifer, PhoneSystem.handleDataHandler);
    }

    public static async handleDataHandler(entity: PlayerMp) {
        if(entity.type != "player") return;

        if(entity.getVariable(PhoneSystem._phoneStatusIdentifer)) {
           PhoneSystem.attachPhoneToPlayer(entity);
           PhoneSystem.playMobilePhoneAnim(entity);
        } else {
            PhoneSystem.resetEntityPhone(entity);
            entity.clearTasks();
        }

    }

    public static async handleStreamIn(entity: PlayerMp) {
        if(entity.type != "player") return;
        let phoneStatus: boolean = entity.getVariable(PhoneSystem._phoneStatusIdentifer);

        if(phoneStatus) {
            PhoneSystem.attachPhoneToPlayer(entity);
            PhoneSystem.playMobilePhoneAnim(entity);
        }
    }

    public static async attachPhoneToPlayer(entity: PlayerMp) {
        PhoneSystem.resetEntityPhone(entity);

        entity._mobilePhone = mp.objects.new('p_amb_phone_01', entity.position, {
            rotation: new mp.Vector3(0, 0, 0),
            alpha: 255,
            dimension: entity.dimension
        });

        for (let i = 0; entity._mobilePhone.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }

        await mp.game.waitAsync(250);

        let pos: Vector3 = new mp.Vector3(0.1500, 0.02, -0.02);
        let rot: Vector3 = new mp.Vector3(71, 96.0, 169);

        entity._mobilePhone.attachTo(entity.handle, 71, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, true, true, false, false, 0, true);
    }

    public static async playMobilePhoneAnim(entity: PlayerMp) {
        for (let i = 0; entity.handle === 0 && i < 15; ++i) {
            await mp.game.waitAsync(100);
        }

        mp.game.streaming.requestAnimDict("cellphone@");
        entity.taskPlayAnim("cellphone@", "cellphone_text_read_base", 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
    }

    public static async resetEntityPhone(entity: PlayerMp) {
        if(entity._mobilePhone) {
            entity._mobilePhone.destroy();
            entity._mobilePhone = null;
        }
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