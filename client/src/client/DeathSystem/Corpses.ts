class Corpses {
    public static LocalPlayer: PlayerMp;

    constructor() {
        Corpses.LocalPlayer = mp.players.local;

        // mp.events.add("playerDeath", Corpses.buildCorpse);
    }

    public static buildCorpse() {
        mp.peds.new(
            mp.game.joaat('MP_F_Freemode_01'),
            Corpses.LocalPlayer.position,
            270.0,
            mp.players.local.dimension
        );
    }
}

export default Corpses;