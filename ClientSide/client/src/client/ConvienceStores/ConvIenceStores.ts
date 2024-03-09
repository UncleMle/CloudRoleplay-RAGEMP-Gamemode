export default class ConvienceStores {
    public static LocalPlayer: PlayerMp = mp.players.local;;
    public static readonly _convienceStoreDataIdentifier: string = "storePedAndColshapeData";

    constructor() {
        mp.events.add("entityStreamIn", ConvienceStores.handleStreamIn);
    }

    public static handleStreamIn(entity: PedMp) {
        if(entity.type == "ped" && entity.getVariable(ConvienceStores._convienceStoreDataIdentifier)) {
            ConvienceStores.initPed(entity);
        }
    }

    private static initPed(ped: PedMp) {
        ped.setDynamic(false);
        ped.freezePosition(true);
        ped.setInvincible(true);
        ped.setProofs(false, false, false, false, false, false, false, false);
    }
}