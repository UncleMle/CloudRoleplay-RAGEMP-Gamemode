import { Corpse } from "@/@types";

class Corpses {
    public static LocalPlayer: PlayerMp;
    public static corpseKey: string = "sync:corpsePed";
    public static corpses: Corpse[] = [];
    public static streamedPeds: PedMp[] = [];

    constructor() {
        Corpses.LocalPlayer = mp.players.local;

        mp.events.add("entityStreamIn", Corpses.handleCorpseStream);
        mp.events.add("corpse:add", Corpses.addCorpsePed);
        mp.events.add("render", Corpses.handleRender);
    }

    public static handleRender() {
        mp.peds.forEach(ped => {
            Corpses.corpses.forEach((Cped, index) => {
                if(ped.remoteId == Cped.remoteId) {
                    mp.gui.chat.push("Synced ped RID " + Cped.remoteId + " model:" + JSON.stringify(Cped.model));
                    ped.taskPlayAnim("dead", "dead_a", 8.0, 0, 600, 1, 1.0, false, false, false);
                }
            })
        });
    }

    public static addCorpsePed(corpse: Corpse) {
        Corpses.corpses.forEach((ped, index: number) => {
            if(ped.remoteId == corpse.remoteId) {
                Corpses.corpses.slice(index, 1);
            }
        });

        console.log(JSON.stringify(corpse));

        Corpses.addCorpsePed(corpse);
    }

    public static handleCorpseStream(entity: EntityMp) {
        if(entity.type != "ped") return;

        mp.events.callRemote(Corpses.corpseKey, entity.remoteId);
        mp.gui.chat.push(entity.type + " was streamed handle: " + entity.handle  + " rid: " + entity.remoteId);
    }
}

export default Corpses;