import { UserData } from "@/@types";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import getUserData from "@/PlayerMethods/getUserData";
import { AdminRanks } from "@/enums";

export default class Afk {
    public static LocalPlayer: PlayerMp;
    public static _updateInterval: ReturnType<typeof setInterval> | undefined;
    public static updateIntervalTime_seconds: number = 200;
    public static oldPlayerPos: Vector3;
    public static serverEvent: string = "server:beginAfk";

    constructor() {
        Afk.LocalPlayer = mp.players.local;

        Afk.oldPlayerPos = Afk.LocalPlayer.position;

        Afk.init();
    }

    public static init() {
        Afk.close();

        Afk._updateInterval = setInterval(() => {
            if(!getUserCharacterData()) return;

            let userData: UserData | undefined = getUserData();

            if(userData && (userData.adminDuty || userData.admin_status > AdminRanks.Admin_HeadAdmin)) return;

            if(Afk.LocalPlayer.position.equals(Afk.oldPlayerPos)) {
                mp.events.callRemote(Afk.serverEvent);
            }

            Afk.oldPlayerPos = Afk.LocalPlayer.position;
        }, Afk.updateIntervalTime_seconds * 1000);
    }

    public static close() {
        if(Afk._updateInterval) {
            clearInterval(Afk._updateInterval);
            Afk._updateInterval = undefined;
        }
    }
}