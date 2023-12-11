class WeaponSystem {
    public static _switchAnimIdentifer: string = "weaponSwitchAnim";

    constructor() {
        mp.events.addDataHandler(WeaponSystem._switchAnimIdentifer, WeaponSystem.handleDataHandler);
        mp.events.add("entityStreamIn", WeaponSystem.handleStreamIn);
    }

    public static handleStreamIn(entity: PlayerMp) {
        if(entity.type != "player") return;

        if(entity.getVariable(WeaponSystem._switchAnimIdentifer)) {
            WeaponSystem.playSwitchAnim(entity);
        }
    }

    public static handleDataHandler(entity: PlayerMp, data: boolean) {
        if(entity.type == "player" && data) {
            WeaponSystem.playSwitchAnim(entity);
        }
    }

    public static async playSwitchAnim(player: PlayerMp) {
        mp.game.streaming.requestAnimDict('reaction@intimidation@1h')
        player.taskPlayAnim('reaction@intimidation@1h', 'intro', 8.0, 1.0, 1110.0, 0 + 32 + 16, 0.0, false, false, false)
    }
}

export default WeaponSystem;