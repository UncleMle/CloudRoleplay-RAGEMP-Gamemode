import { Corpse } from "@/@types";
import CharacterSystem from "@/Character/CharacterSystem";
import getTimeUnix from "@/PlayerMethods/getTimeUnix";

class Corpses {
    public static LocalPlayer: PlayerMp;
    public static corpseKey: string = "sync:corpsePed";
    public static corpseValEvent: string = "sync:corpseValidation";
    public static corpses: Corpse[] = [];

    constructor() {
        Corpses.LocalPlayer = mp.players.local;

        mp.events.add("entityStreamIn", Corpses.handleStreamIn);
        mp.events.add("corpse:add", Corpses.addCorpsePed);
        mp.events.add("corpse:setCorpses", Corpses.setCorpses);
        mp.events.add("corpse:removeCorpse", Corpses.spliceCorpsePed);
    }

    public static handleStreamIn(entity: PedMp) {
        if(entity.type != "ped") return;


        setTimeout(() => {
            let corpseData: Corpse | null = Corpses.getCorpseData(entity.corpseId);
            if(!corpseData) return;

            mp.events.callRemote(Corpses.corpseValEvent, JSON.stringify(corpseData));

            Corpses.initPed(entity, corpseData);
        }, 500);
    }

    public static setCorpses(corpses: Corpse[]) {
        mp.console.logInfo("Set corpses" + JSON.stringify(corpses));

        corpses.forEach((corpse: Corpse, index: number) => {
            let ped: PedMp = mp.peds.new(mp.game.joaat( corpse.model.sex ? "mp_m_freemode_01" : "mp_f_freemode_01"), new mp.Vector3(corpse.position.x, corpse.position.y, corpse.position.z), 0, 0);

            ped.corpseCharacterId = corpse.characterId;
            ped.corpseId = index;
            corpse.corpseId = index;
            corpses[index] = corpse;
        });

        Corpses.corpses = corpses;
    }

    public static addCorpsePed(corpse: Corpse) {
        let corpseData: Corpse = corpse;
        let ped: PedMp = mp.peds.new(mp.game.joaat( corpse.model.sex ? "mp_m_freemode_01" : "mp_f_freemode_01"), new mp.Vector3(corpse.position.x, corpse.position.y, corpse.position.z), 0, 0);

        Corpses.corpses.push(corpse);

        corpseData.corpseId = Corpses.corpses.indexOf(corpse);
        ped.corpseId = corpse.corpseId;
        ped.corpseCharacterId = corpse.characterId;
        ped.taskPlayAnim("dead", "dead_a", 8.0, 0, 600, 1, 1.0, false, false, false);

        Corpses.corpses[corpse.corpseId] = corpseData;
    }

    public static spliceCorpsePed(corpse: Corpse) {
        let index: number = Corpses.corpses.indexOf(corpse);
        Corpses.corpses.splice(index, 1);

        mp.peds.forEach((ped: PedMp) => {
            if(corpse.characterId == ped.corpseCharacterId) {
                ped.destroy();
            }
        })
    }

    public static getCorpseData(corpseId: number): Corpse | null {
        let corpseData: Corpse | null = null;

        Corpses.corpses.forEach((corpse: Corpse) => {
            if(corpse.corpseId == corpseId) {
                corpseData = corpse;
            }
        });

        return corpseData;
    }

    public static initPed(ped: PedMp, corpseData: Corpse) {
        if(!ped || !corpseData) return;

        ped.freezePosition(false);
        ped.setInvincible(false);
        ped.setProofs(false, false, false, false, false, false, false, false);
        ped.taskPlayAnim("dead", "dead_a", 8.0, 0, 600, 1, 1.0, false, false, false);

        CharacterSystem.setCharacterCustomization(corpseData.model, false, ped);
    }

}

export default Corpses;