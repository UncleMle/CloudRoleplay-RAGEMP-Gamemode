import { _control_ids } from "@/Constants/Constants";

export default class BusDriverJob {
    private static LocalPlayer: PlayerMp = mp.players.local;
    private static readonly _busDepoColShapeData: string = "playerEnteredBusDepoColshape";
    public static readonly startRemoteEvent: string = "server:playerAttemptBusJobStart";

    constructor() {
        mp.keys.bind(_control_ids.Y, false, BusDriverJob.handleKeyPress);        
    }

    private static handleKeyPress() {
        if(BusDriverJob.LocalPlayer.getVariable(BusDriverJob._busDepoColShapeData)) {
            mp.events.callRemote(BusDriverJob.startRemoteEvent);
        }
    }
}