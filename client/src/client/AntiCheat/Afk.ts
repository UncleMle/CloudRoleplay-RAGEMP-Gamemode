import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";

export class Afk {
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

export default Afk;